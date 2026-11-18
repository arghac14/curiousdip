const assert=require('assert'),fs=require('fs'),vm=require('vm');
const source=fs.readFileSync('assets/views.js','utf8').replace("import(base+'firebase-'+name+'.js')",'sdkImport(name)');
const records=new Map();let writes=0,transactions=0,signins=0;
function harness(uid,hostname='example.com'){
  const auth={currentUser:null,async authStateReady(){}},observers=[];
  const sdk={
    initializeApp:(config,name)=>{assert.equal(name,'curiousdip-views');return {name};},
    getAuth:app=>{assert.equal(app.name,'curiousdip-views');return auth;},getFirestore:()=>({}),browserLocalPersistence:'local',
    setPersistence:async(auth,mode)=>assert.equal(mode,'local'),signInAnonymously:async auth=>{signins++;auth.currentUser={uid};},
    collection:(db,...path)=>path.join('/'),doc:(collection,uid)=>collection+'/'+uid,serverTimestamp:()=>1,
    runTransaction:async(db,fn)=>{transactions++;return fn({get:async ref=>({exists:()=>records.has(ref)}),set:(ref,value)=>{records.set(ref,value);writes++;}});},
    getCountFromServer:async ref=>({data:()=>({count:[...records.keys()].filter(key=>key.startsWith(ref+'/')).length})})
  };
  const ctx=vm.createContext({location:{hostname,protocol:'https:'},CURIOUSDIP_FIREBASE:{projectId:'test'},sdkImport:async()=>sdk,IntersectionObserver:class{constructor(fn,options){assert.equal(options.threshold,.25);this.fn=fn;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}});
  vm.runInContext(source,ctx);
  return {ctx,auth,observers,mount:(item,target)=>{const output={isConnected:true,setAttribute(key,value){this[key]=value;}};const stop=ctx.CuriousDipViews.mount(output,item,target);return {output,stop};},reload:()=>vm.runInContext(source,ctx)};
}
const flush=async()=>{for(let n=0;n<8;n++)await new Promise(resolve=>setImmediate(resolve));};
(async()=>{
  const browser=harness('browser-one'),story={type:'series',id:1};
  const one=browser.mount(story),two=browser.mount(story);await flush();
  assert.equal(writes,1,'Concurrent mounts share a single view record');assert.equal(signins,1);assert.equal(one.output.textContent,'1 view');assert.equal(two.output.textContent,'1 view');
  browser.reload();browser.mount(story);await flush();assert.equal(writes,1,'Reload must not create another view');assert.equal(signins,1,'Persisted browser identity must be reused');
  browser.mount({type:'blog',id:1});await flush();assert.equal(writes,2,'IDs in different content types have separate counters');
  const other=harness('browser-two');const second=other.mount(story);await flush();assert.equal(writes,3);assert.equal(second.output.textContent,'2 views');
  const video=browser.mount({type:'video',id:1},{});await flush();assert.equal(writes,3,'Offscreen videos must not count');
  browser.observers[0].fn([{isIntersecting:true,intersectionRatio:.1}]);await flush();assert.equal(writes,3);
  browser.observers[0].fn([{isIntersecting:true,intersectionRatio:.25}]);await flush();assert.equal(writes,4);assert.equal(video.output.textContent,'1 view');
  const cancelled=browser.mount({type:'video',id:2},{});cancelled.stop();browser.observers[1].fn([{isIntersecting:true,intersectionRatio:1}]);await flush();assert.equal(writes,4,'Navigation cleanup prevents queued offscreen counts');
  const before=signins,local=harness('preview','127.0.0.1');const preview=local.mount(story);await flush();assert.equal(writes,4);assert.equal(signins,before,'Local preview must not create anonymous accounts');assert.equal(preview.output.textContent,'2 views');
  console.log('Unique view checks passed: persistent browser identity, duplicate/reload deduplication, separate stories, second browser, video visibility, route cleanup and read-only local previews.');
})().catch(error=>{console.error(error);process.exitCode=1;});
