const assert=require('assert'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync('assets/loader.js','utf8');
async function check(reduce){
  let resolvePhoto,decodes=0,removed=0;
  const timers=new Map();let timerId=0;
  const blocks=[{inert:true,removeAttribute(name){assert.equal(name,'data-boot-inert');this.cleaned=true;}}];
  const main={setAttribute(name,value){this[name]=value;}};
  const loader={setAttribute(name,value){this[name]=value;},classList:{add(name){assert.equal(name,'is-ready');}},remove(){removed++;}};
  const image={closest:()=>null,getBoundingClientRect:()=>({top:100,bottom:400}),decode:()=>{decodes++;return new Promise(resolve=>{resolvePhoto=resolve;});}};
  const excluded={closest:()=>({}),decode(){throw Error('Background must not be decoded again');}};
  const below={closest:()=>null,getBoundingClientRect:()=>({top:2000,bottom:2400}),decode(){throw Error('Below-fold photo must not delay opening');}};
  const doc={body:{classList:{remove(name){assert.equal(name,'is-initializing');}}},querySelectorAll(selector){return selector==='#main img'?[image,excluded,below]:blocks;},querySelector(selector){return selector==='#main'?main:loader;}};
  const ctx=vm.createContext({document:doc,innerHeight:800,matchMedia:()=>({matches:reduce}),setTimeout(fn,delay){const id=++timerId;timers.set(id,{fn,delay});return id;},clearTimeout(id){timers.delete(id);}});
  vm.runInContext(source,ctx);
  const pending=ctx.CuriousDipLoader.openingPhotos();assert.equal(decodes,1);assert.equal(removed,0,'Loader must stay while a visible image is pending');
  resolvePhoto();await pending;assert(![...timers.values()].some(timer=>timer.delay===6000),'Clear the timeout after photos finish');
  ctx.CuriousDipLoader.finish();assert.equal(main['aria-busy'],'false');assert(!blocks[0].inert&&blocks[0].cleaned);
  if(!reduce){assert.equal(removed,0);[...timers.values()].find(timer=>timer.delay===350).fn();}
  assert.equal(removed,1);ctx.CuriousDipLoader.finish();assert.equal(removed,1,'Cleanup is safe to call again');
  // Failure cleanup uses the same finalizer and must work even before photos are requested.
  const failed=vm.createContext({document:doc,matchMedia:()=>({matches:true})});vm.runInContext(source,failed);failed.CuriousDipLoader.finish();assert.equal(removed,2);
}
(async()=>{await check(false);await check(true);console.log('Loader checks passed: visible-photo waiting, offscreen/background exclusion, cleanup and reduced motion.');})().catch(error=>{console.error(error);process.exitCode=1;});
