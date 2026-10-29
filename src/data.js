import { catalog, catalogMeta, catalogSources, catalogCandidates, catalogExclusions } from './catalog.js';

export { catalogMeta, catalogCandidates, catalogExclusions };
export const brands = [
 { id:'ninebot',name:'九号',english:'ninebot',line:'聪明骑行，自有一套。',color:'#53887d' },
 { id:'zeeho',name:'极核',english:'ZEEHO',line:'生来带电，不甘平凡。',color:'#b2a08c' },
 { id:'niu',name:'小牛',english:'NIU',line:'有型有趣，城市随行。',color:'#c6a096' }
];
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const formatPrice = value => typeof value==='number' && Number.isFinite(value) ? value.toLocaleString('zh-CN') : '待核实';
export const formatNumber = (value,unit='') => typeof value==='number' && Number.isFinite(value) ? `${Number(value.toFixed(2))}${unit ? ' '+unit : ''}` : '未公开';
export const classLabels = {motorcycle:'电动摩托车',moped:'电动轻便摩托车',motorcycle_unspecified:'电摩 · 细分类待核',unknown:'类别待核实'};
export const statusLabels = {on_sale:'官网列售',channel_stock:'渠道库存',preorder:'预售／待上市',discontinued:'历史车型',unconfirmed:'在售待核实'};
export const imageLabels = {photo:'真实实拍',official_render:'官方渲染',unclassified:'图片类型待核实'};
export const priceLabels = {official_current:'官方公开价',launch:'上市指导价',dealer:'渠道参考价',unknown:'价格待核实'};
export const sourceLabels = {official_product:'官方产品页',official_store:'官方商城',official_news:'官方发布',manual:'使用说明',homologation:'公告及认证',authorized_dealer:'授权经销商',media:'媒体报道',other:'其他资料'};
export const formatSpec = (model,key,unit='') => {
 const value=model.specs?.[key];
 if(typeof value!=='number'||!Number.isFinite(value))return '未公开';
 const quote=model.evidence?.[key]?.quote||'';
 const literal=String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),speedUnits='km\\s*/\\s*h';
 const hasPlus=key==='topSpeedKmh'&&new RegExp(`${literal}\\s*(?:\\+\\s*${speedUnits}|${speedUnits}\\s*\\+)`,'i').test(quote);
 const lowerOperator=key==='topSpeedKmh'?(quote.match(new RegExp(`([>≥＞])\\s*${literal}\\s*${speedUnits}`,'i'))?.[1]||''):'';
 return `${lowerOperator}${Number(value.toFixed(2))}${hasPlus?'+':''}${unit?' '+unit:''}`;
};
export const budgetOptions = [
 {id:'all',label:'不限预算',min:0,max:Infinity},
 {id:'under-5000',label:'5 千元以下',min:0,max:5000},
 {id:'5000-7999',label:'5 千–8 千元',min:5000,max:8000},
 {id:'8000-11999',label:'8 千–1.2 万元',min:8000,max:12000},
 {id:'12000-19999',label:'1.2–2 万元',min:12000,max:20000},
 {id:'20000-up',label:'2 万元及以上',min:20000,max:Infinity},
 {id:'unknown',label:'价格待核实',min:null,max:null}
];
export const inBudget = (model,id) => {const option=budgetOptions.find(x=>x.id===id)||budgetOptions[0];if(id==='all')return true;if(id==='unknown')return model.price===null;return typeof model.price==='number'&&model.price>=option.min&&model.price<option.max;};
export const compareNumeric = (a,b,getter,direction=1) => {
 const av=getter(a),bv=getter(b),aKnown=typeof av==='number'&&Number.isFinite(av),bKnown=typeof bv==='number'&&Number.isFinite(bv);
 if(!aKnown)return bKnown?1:0;if(!bKnown)return -1;return (av-bv)*direction;
};
export const recommendModels = (records,answers) => {
 const eligible=records.filter(model=>['on_sale','channel_stock'].includes(model.saleStatus)&&inBudget(model,answers.budget||'all')&&(answers.vehicleClass==='any'||model.vehicleClass===answers.vehicleClass));
 const criterion=model=>answers.priority==='battery'?model.specs.batteryEnergyWh??-1:answers.priority==='safety'?({dual:3,single:2,present_unspecified:1,none:0}[model.specs.abs]??-1):model.specs.unlockModes?.length||-1;
 return eligible.sort((a,b)=>criterion(b)-criterion(a)||compareNumeric(a,b,m=>m.price));
};
export const sourcesFor = model => {const ids=new Set([...(model.sourceIds||[]),...Object.values(model.evidence||{}).flatMap(item=>item.sourceIds||[]),...(model.gallery||[]).map(image=>image.sourceId)]);return catalogSources.filter(source=>ids.has(source.id));};
export const labelFor = model => `${model.name}${model.variant && !model.name.includes(model.variant) ? ' · '+model.variant : ''}${model.modelYear ? ' / '+model.modelYear : ''}`;
export const models = catalog.map(raw=>{
 const s=raw.specs || {}, galleries=raw.gallery || [];
 const preferred=galleries.find(x=>x.kind==='photo')||galleries[0]||null;
 const batteryParts=[s.batteryVoltageV ? s.batteryVoltageV+'V' : '',s.batteryCapacityAh ? s.batteryCapacityAh+'Ah' : '',s.batteryCount ? s.batteryCount+'组' : ''].filter(Boolean);
 const detailsMissing = raw.price===null || raw.vehicleClass==='motorcycle_unspecified' || ['topSpeedKmh','ratedPowerW','batteryEnergyWh','abs'].some(key=>s[key]===null||s[key]===undefined||s[key]==='unknown');
 return {...raw,gallery:galleries,title:labelFor(raw),image:preferred?.src||null,cover:preferred,speed:s.topSpeedKmh??null,range:s.rangeKm??null,power:s.peakPowerW? s.peakPowerW/1000:null,ratedPower:s.ratedPowerW? s.ratedPowerW/1000:null,battery:batteryParts.join(' / ')||'未公开',charge:formatNumber(s.chargeHours,'小时'),brake:s.brakes||'未公开',weight:formatNumber(s.curbWeightKg,'kg'),seat:formatNumber(s.seatHeightMm,'mm'),tags:(raw.highlights||[]).slice(0,3),subtitle:raw.summary||classLabels[raw.vehicleClass],intro:raw.summary||'查看已核验的版本资料、参数与来源。',description:raw.summary||'',badge:classLabels[raw.vehicleClass],year:raw.modelYear?raw.modelYear+'款':raw.series||'年款未公开',color:brands.find(b=>b.id===raw.brand)?.color||'#899b7c',photoCount:galleries.filter(x=>x.kind==='photo').length,categories:[raw.vehicleClass,...(detailsMissing||galleries.filter(x=>x.kind==='photo').length<3?['incomplete']:[])]};
});
export const dataNote = `资料快照截至 ${catalogMeta.asOf}。本次核验 ${catalogMeta.modelCount} 个车型、${catalogMeta.variantCount} 条配置记录；另有 ${catalogMeta.candidateCount} 条候选待核实。价格与在售状态保留来源和口径，图片区分实拍、官方渲染和待确认类型。不同工况的续航不直接排名。`;
