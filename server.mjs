import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const useDist = process.argv.includes('--dist');
const root = path.resolve(useDist ? 'dist' : '.');
const portArg = process.argv.indexOf('--port');
const port = Number(portArg > -1 ? process.argv[portArg + 1] : process.env.PORT || 5173);
const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json; charset=utf-8'};
http.createServer((req,res)=>{
 let requestPath;
 try { requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch {res.writeHead(400);return res.end('Bad request');}
 let filePath = path.resolve(root, '.' + requestPath);
 if (!filePath.startsWith(root + path.sep) && filePath !== root) {res.writeHead(403);return res.end('Forbidden');}
 if (!useDist && !fs.existsSync(filePath)) filePath = path.resolve(root,'public','.' + requestPath);
 if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) filePath = path.join(root,'index.html');
 try {const data=fs.readFileSync(filePath);res.writeHead(200,{'Content-Type':types[path.extname(filePath)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);}catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`九牛核 ready at http://localhost:${port}`));
