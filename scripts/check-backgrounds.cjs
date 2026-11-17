const assert=require('assert'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync('assets/app.js','utf8');
const start=source.indexOf('const backgroundImages=new Map();');
const code=source.slice(start,source.indexOf('function route(',start));
assert(start>=0&&code.includes('prepareBackgrounds'));
async function check(failed) {
  const attempts=[];
  class Image {
    async decode(){attempts.push(this.src);if(failed.includes(this.src))throw Error('Broken image');}
  }
  const ctx=vm.createContext({Image,content:{pageBackgrounds:{'/':[{url:'a.jpg'}],'/series':[{url:'b.jpg'}],'/blogs':[{url:'a.jpg'}]}},imageURL:image=>image.url,CuriousDipData:{image:url=>({url})}});
  vm.runInContext(code,ctx);
  await vm.runInContext('prepareBackgrounds()',ctx);
  assert.equal(attempts.filter(url=>url==='a.jpg').length,1,'Repeated selection loads only once');
  assert.equal(attempts.filter(url=>url==='b.jpg').length,1);
  assert(vm.runInContext("backgroundImages.get('a.jpg')",ctx));
  assert(vm.runInContext("backgroundImages.get('b.jpg')",ctx));
  if(failed.length)assert(vm.runInContext("backgroundImages.get('a.jpg')===backgroundImages.get('b.jpg')",ctx),'Failed selections reuse a loaded fallback');
  if(failed.length===2)assert(attempts.includes('assets/dynamic/sample-landscape.svg'));
}
(async()=>{await check([]);await check(['b.jpg']);await check(['a.jpg','b.jpg']);console.log('Backgrounds preload once per unique image; failed files use decoded fallbacks.');})().catch(error=>{console.error(error);process.exitCode=1;});
