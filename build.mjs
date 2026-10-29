import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const { data }=await import('./scripts/build-catalog.mjs');
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await cp('public','dist',{recursive:true,filter:source=>path.resolve(source)!==path.resolve('public/images/catalog')});
const imagePaths=new Set(data.models.flatMap(model=>model.gallery.flatMap(image=>[image.src,image.thumbnail])));
for(const asset of imagePaths){const relative=asset.replace(/^\.\//,'');await mkdir(path.dirname(path.join('dist',relative)),{recursive:true});await cp(path.join('public',relative),path.join('dist',relative));}
let html=await readFile('index.html','utf8');
const [style,modalStyle,...modules]=await Promise.all([
 readFile('src/style.css','utf8'),readFile('src/modals.css','utf8'),
 ...['catalog','data','modals','main'].map(name=>readFile(`src/${name}.js`,'utf8'))
]);
const script=modules.map(source=>source.replace(/^import .*?;\s*$/gm,'').replace(/^export\s*\{[^}]*\};?\s*$/gm,'').replace(/^export /gm,'')).join('\n');
const syntax=spawnSync(process.execPath,['--check','--input-type=module'],{input:script,encoding:'utf8'});
if(syntax.status!==0)throw new Error(`Combined browser script failed syntax check: ${syntax.stderr || syntax.error}`);
const favicon='data:image/svg+xml;base64,'+Buffer.from(await readFile('public/favicon.svg')).toString('base64');
html=html.replace(/href="(?:\.\/|\/)favicon.svg"/,()=>`href="${favicon}"`)
 .replace(/\s*<link rel="stylesheet" href="(?:\.\/|\/)src\/[^\"]+" \/>/g,'')
 .replace('</head>',()=>`<style>${style}\n${modalStyle}</style>\n</head>`)
 .replace(/<script type="module" src="(?:\.\/|\/)src\/main.js"><\/script>/,()=>`<script type="module">\n${script.replace(/<\/script/gi,'<\\/script')}\n</script>`);
const embedded=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
if(!embedded)throw new Error('Built HTML is missing its inline module.');
const embeddedSyntax=spawnSync(process.execPath,['--check','--input-type=module'],{input:embedded,encoding:'utf8'});
if(embeddedSyntax.status!==0)throw new Error(`Built HTML script failed syntax check: ${embeddedSyntax.stderr || embeddedSyntax.error}`);
await writeFile('dist/index.html',html);
const preview=html.replaceAll('./images/','./public/images/').replaceAll('./data/catalog.json','./public/data/catalog.json');
await writeFile('preview.html',preview);
console.log('Built static website → dist/');
console.log('Local offline preview with public/ assets → preview.html');
