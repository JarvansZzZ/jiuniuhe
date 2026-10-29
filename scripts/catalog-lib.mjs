import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const SNAPSHOT_DATE = '2026-10-28';
export const BRAND_KEYS = ['ninebot', 'niu', 'zeeho'];
const numericSpecs = new Set(['topSpeedKmh','ratedPowerW','peakPowerW','rangeKm','batteryVoltageV','batteryCapacityAh','batteryCount','batteryEnergyWh','chargeHours','curbWeightKg','seatHeightMm','wheelbaseMm','storageLitres']);
const finite = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isUrl = value => {try {return ['https:', 'http:'].includes(new URL(value).protocol);} catch {return false;}};

export async function loadCatalog(projectRoot = process.cwd()) {
  const files = await Promise.all(BRAND_KEYS.map(async brand => {
    const file = path.join(projectRoot, 'data/catalog', `${brand}.json`);
    const data = JSON.parse(await readFile(file, 'utf8'));
    if (data.brand !== brand || data.asOf !== SNAPSHOT_DATE) throw new Error(`${brand}: wrong brand or snapshot date`);
    for (const key of ['models', 'candidates', 'exclusions', 'sources']) if (!Array.isArray(data[key])) throw new Error(`${brand}: ${key} must be an array`);
    return data;
  }));
  const models = [], sources = [], candidates = [], exclusions = [], issues = [], ids = new Set(), assetHashes = new Map();
  const sourceIds = new Set();
  for (const file of files) {
    for (const source of file.sources) {
      if (!source.id || sourceIds.has(source.id)) throw new Error(`Duplicate or missing source id: ${source.id}`);
      if (!isUrl(source.url)) throw new Error(`Invalid source URL: ${source.id}`);
      if (source.publishedAt && source.publishedAt.slice(0, 10) > SNAPSHOT_DATE) throw new Error(`${source.id}: source published after snapshot`);
      sourceIds.add(source.id);sources.push(source);
    }
  }
  for (const file of files) {
    for (const raw of file.models) {
      const model = structuredClone(raw);
      if (!model.id || ids.has(model.id) || !/^[a-z0-9][a-z0-9-]+$/.test(model.id)) throw new Error(`Invalid or duplicate model id: ${model.id}`);
      ids.add(model.id);
      if (model.brand !== file.brand || model.market !== 'CN') throw new Error(`${model.id}: brand/market mismatch`);
      if (!['motorcycle','moped','motorcycle_unspecified'].includes(model.vehicleClass)) throw new Error(`${model.id}: unconfirmed vehicle class belongs in candidates`);
      if (!['on_sale','channel_stock','preorder','discontinued','unconfirmed'].includes(model.saleStatus)) throw new Error(`${model.id}: invalid sale status`);
      if (model.price !== null && model.price !== undefined && (!finite(model.price) || model.price === 0)) throw new Error(`${model.id}: price must be a positive number or null`);
      model.price ??= null;model.launchPrice ??= null;model.gallery ??= [];model.specs ??= {};model.notes ??= [];
      if (!['official_current','launch','dealer','unknown'].includes(model.priceType)) throw new Error(`${model.id}: invalid price type`);
      if (model.launchPrice !== null && (!finite(model.launchPrice) || model.launchPrice === 0)) throw new Error(`${model.id}: invalid launch price`);
      if (!Array.isArray(model.sourceIds) || !model.sourceIds.length) throw new Error(`${model.id}: source references required`);
      for (const id of model.sourceIds) if (!sourceIds.has(id)) throw new Error(`${model.id}: missing source ${id}`);
      const evidence = model.evidence || {};
      if (!evidence.vehicleClass?.sourceIds?.length || !evidence.vehicleClass?.quote) throw new Error(`${model.id}: vehicle class evidence required`);
      if (model.price !== null && !evidence.price?.sourceIds?.length) throw new Error(`${model.id}: numeric price requires evidence`);
      for (const [key,value] of Object.entries(model.specs)) {
        if (numericSpecs.has(key) && value !== null && value !== undefined && !finite(value)) throw new Error(`${model.id}: ${key} must be a nonnegative number or null`);
        if (typeof value === 'number' && !finite(value)) throw new Error(`${model.id}: invalid ${key}`);
        if (typeof value === 'number' && !evidence[key]?.sourceIds?.length) issues.push({brand:file.brand,model:model.id,type:'missing_field_evidence',message:`${key}: needs a field-level citation`});
      }
      if (model.specs.batteryRemovable !== null && model.specs.batteryRemovable !== undefined && typeof model.specs.batteryRemovable !== 'boolean') throw new Error(`${model.id}: batteryRemovable must be boolean or null`);
      if (model.specs.unlockModes !== null && model.specs.unlockModes !== undefined && !Array.isArray(model.specs.unlockModes)) throw new Error(`${model.id}: unlockModes must be an array`);
      if (model.specs.abs && !['dual','single','present_unspecified','none','unknown'].includes(model.specs.abs)) throw new Error(`${model.id}: invalid ABS state`);
      if (model.specs.tcs && !['standard','optional','none','unknown'].includes(model.specs.tcs)) throw new Error(`${model.id}: invalid TCS state`);
      for (const [field, item] of Object.entries(evidence)) {
        for (const id of item.sourceIds || []) if (!sourceIds.has(id)) throw new Error(`${model.id}: ${field} cites missing source ${id}`);
      }
      const seen = new Set();
      model.gallery = await Promise.all(model.gallery.map(async image => {
        if (!['photo','official_render','unclassified'].includes(image.kind)) throw new Error(`${model.id}: invalid image kind`);
        if (!image.src?.startsWith(`/images/catalog/${file.brand}/`) && !image.src?.startsWith(`./images/catalog/${file.brand}/`)) throw new Error(`${model.id}: image must be stored in its local brand directory`);
        if (!isUrl(image.sourcePage) || !isUrl(image.originalUrl)) throw new Error(`${model.id}: image provenance required`);
        if (!sourceIds.has(image.sourceId)) throw new Error(`${model.id}: image source does not exist`);
        const local = path.resolve(projectRoot, 'public', image.src.replace(/^\.?\//, ''));
        if (!local.startsWith(path.resolve(projectRoot,'public/images/catalog') + path.sep)) throw new Error(`${model.id}: unsafe image path`);
        const bytes = await readFile(local);
        const hash = createHash('sha256').update(bytes).digest('hex');
        if (seen.has(hash)) throw new Error(`${model.id}: repeated image file in gallery`);
        seen.add(hash);assetHashes.set(local,hash);
        if (image.thumbnail) await access(path.resolve(projectRoot,'public',image.thumbnail.replace(/^\.?\//,'')));
        if (!image.matchNote) issues.push({brand:file.brand,model:model.id,type:'image_match',message:`${image.id}: match evidence needs review`});
        return {...image,sha256:hash,src: './' + image.src.replace(/^\.?\//,''),thumbnail:'./'+(image.thumbnail || image.src).replace(/^\.?\//,'')};
      }));
      model.photoCount=model.gallery.filter(image=>image.kind==='photo').length;
      model.renderCount=model.gallery.filter(image=>image.kind==='official_render').length;
      model.imageStatus=model.photoCount>=3?'complete':model.gallery.length?'partial':'missing';
      if (model.photoCount<3) issues.push({brand:file.brand,model:model.id,type:'photo_gap',message:`${model.photoCount}/3 verified real photos`});
      if (model.price===null) issues.push({brand:file.brand,model:model.id,type:'price_gap',message:'No comparable verified price'});
      models.push(model);
    }
    for(const item of [...file.candidates,...file.exclusions]){
      if(!item.name||!item.reason)throw new Error(`${file.brand}: candidate/exclusion needs a name and reason`);
      for(const id of item.sourceIds||[])if(!sourceIds.has(id))throw new Error(`${file.brand}: ${item.name} cites missing source ${id}`);
    }
    candidates.push(...file.candidates.map(item=>({...item,brand:file.brand})));
    exclusions.push(...file.exclusions.map(item=>({...item,brand:file.brand})));
  }
  const perBrand = Object.fromEntries(BRAND_KEYS.map(brand=>{
    const rows=models.filter(m=>m.brand===brand);
    return [brand,{models:new Set(rows.map(m=>`${m.name}|${m.modelYear ?? ''}`)).size,variants:rows.length,priced:rows.filter(m=>m.price!==null).length,photoComplete:rows.filter(m=>m.photoCount>=3).length,photoAssignments:rows.reduce((n,m)=>n+m.photoCount,0),galleryAssignments:rows.reduce((n,m)=>n+m.gallery.length,0),candidates:candidates.filter(m=>m.brand===brand).length,exclusions:exclusions.filter(m=>m.brand===brand).length}];
  }));
  const meta={asOf:SNAPSHOT_DATE,generatedAt:new Date().toISOString(),modelCount:new Set(models.map(m=>`${m.brand}|${m.name}|${m.modelYear ?? ''}`)).size,variantCount:models.length,pricedCount:models.filter(m=>m.price!==null).length,photoCompleteCount:models.filter(m=>m.photoCount>=3).length,uniqueAssets:assetHashes.size,uniquePhotoAssets:new Set(models.flatMap(model=>model.gallery.filter(image=>image.kind==='photo').map(image=>image.src))).size,sourceCount:sources.length,candidateCount:candidates.length,excludedCount:exclusions.length,perBrand,coverageNotes:files.flatMap(file=>(file.coverageNotes || []).map(note=>({brand:file.brand,note})))};
  return {meta,models,sources,candidates,exclusions,issues};
}
