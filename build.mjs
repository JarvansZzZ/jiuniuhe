import { cp, mkdir, readFile, copyFile, rm, writeFile } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('src', 'dist/src', { recursive: true });
await cp('public', 'dist', { recursive: true });
let html = await readFile('index.html', 'utf8');
const [style, modalStyle, data, modals, main] = await Promise.all([
 readFile('src/style.css', 'utf8'), readFile('src/modals.css', 'utf8'),
 readFile('src/data.js', 'utf8'), readFile('src/modals.js', 'utf8'), readFile('src/main.js', 'utf8')
]);
let script = [data, modals, main].map(source => source.replace(/^import .*?;\s*$/gm, '').replace(/^export /gm, '')).join('\n');
for (const name of ['ninebot', 'zeeho', 'niu', 'hero-scooter']) {
 const image = 'data:image/svg+xml;base64,' + Buffer.from(await readFile(`public/images/${name}.svg`)).toString('base64');
 script = script.replaceAll(`/images/${name}.svg`, image);
}
const favicon = 'data:image/svg+xml;base64,' + Buffer.from(await readFile('public/favicon.svg')).toString('base64');
html = html.replace('href="/favicon.svg"', `href="${favicon}"`)
 .replace(/\s*<link rel="stylesheet" href="\/src\/[^\"]+" \/>/g, '')
 .replace('</head>', `<style>${style}\n${modalStyle}</style>\n</head>`)
 .replace('<script type="module" src="/src/main.js"></script>', `<script type="module">\n${script.replaceAll('</script', '<\\/script')}\n</script>`);
await writeFile('dist/index.html', html);
await copyFile('dist/index.html', 'preview.html');
console.log('Built successfully → dist/');
console.log('Standalone offline preview → preview.html');
