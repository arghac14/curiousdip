const http = require('http');
const fs = require('fs');
const path = require('path');
const scanPresets = require('./presets.cjs');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.avif':'image/avif' };
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  if (pathname === '/data/presets.json') {
    try {
      res.writeHead(200, {'Content-Type':'application/json', 'Cache-Control':'no-store'});
      res.end(JSON.stringify(scanPresets(root)));
    } catch { res.writeHead(500).end('Preset folders could not be read'); }
    return;
  }
  const file = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
  if (!file.startsWith(root + path.sep) || pathname.split('/').some(x => x.startsWith('.') || ['scripts','node_modules','admin'].includes(x))) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => { res.writeHead(err ? 404 : 200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' }); res.end(err ? 'Not found' : data); });
}).listen(4321, '127.0.0.1', () => console.log('CuriousDip: http://127.0.0.1:4321'));
