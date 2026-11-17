const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve('dist');
for(const forbidden of ['admin','scripts','.git','.env','CONTEXT.md'])assert(!fs.existsSync(path.join(root,forbidden)),forbidden+' must not deploy');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))assert(fs.existsSync(path.resolve(root,match[1])),'Missing asset '+match[1]);
const presets=JSON.parse(fs.readFileSync(path.join(root,'data/presets.json'),'utf8'));
for(const file of Object.values(presets).flat())assert(fs.existsSync(path.join(root,decodeURIComponent(file))),'Missing preset '+file);
assert(!/(?:src|href)="\/(?!\/)/.test(html),'Portfolio assets must support GitHub project subpaths');
console.log('Build contains required assets and presets, supports relative paths, and excludes local admin.');
