const assert=require('assert'),fs=require('fs'),vm=require('vm');
class Node {
  constructor(tag){this.tag=tag;this.children=[];this.isConnected=true;this.dataset={};this.attributes={};this.value='';}
  append(...children){this.children.push(...children);}
  replaceChildren(...children){this.children=children;}
  setAttribute(key,value){this.attributes[key]=value;}
  focus(){this.focused=true;}
}
const observers=[];let observerCalls=0,writeFailure=false,storedComments=[],likes=new Set(),authListener,tracked=0;
const user={uid:'alice',displayName:'Alice',email:'alice@example.com',emailVerified:true};
const auth={currentUser:null,async authStateReady(){}};
const ref=(db,...path)=>path.join('/');
const sdk={
  initializeApp:()=>({}),getAuth:()=>auth,getFirestore:()=>({}),
  onAuthStateChanged:(auth,fn)=>{authListener=fn;},GoogleAuthProvider:class{},
  signInWithPopup:async()=>{auth.currentUser=user;await authListener();},
  signOut:async()=>{auth.currentUser=null;await authListener();},
  doc:ref,collection:ref,serverTimestamp:()=>({toDate:()=>new Date('2026-01-01')}),
  orderBy:(field,direction)=>({field,direction}),limit:value=>({limit:value}),startAfter:cursor=>({cursor}),query:(ref,...constraints)=>({ref,constraints}),
  getCountFromServer:async()=>({data:()=>({count:likes.size})}),
  getDoc:async ref=>({exists:()=>likes.has(ref)}),
  getDocs:async query=>{
    assert(query.constraints.some(c=>c.limit===20),'Comment reads must be bounded');
    return {docs:storedComments.map(row=>({id:row.id,data:()=>row})),size:storedComments.length};
  },
  runTransaction:async(db,fn)=>fn({get:async ref=>({exists:()=>likes.has(ref)}),set:ref=>likes.add(ref),delete:ref=>likes.delete(ref)}),
  addDoc:async(ref,row)=>{if(writeFailure)throw {code:'permission-denied'};storedComments.push({id:'new-comment',...row});},
  deleteDoc:async ref=>{storedComments=storedComments.filter(row=>!ref.endsWith('/'+row.id));}
};
const ctx=vm.createContext({CuriousDipViews:{mount:()=>{tracked++;return()=>{};}},document:{createElement:tag=>new Node(tag)},CURIOUSDIP_FIREBASE:{projectId:'test'},confirm:()=>true,IntersectionObserver:class{constructor(fn){this.fn=fn;observers.push(this);}observe(){}disconnect(){observerCalls++;}},sdkImport:async()=>sdk});
const source=fs.readFileSync('assets/social.js','utf8').replace("import(base+'firebase-'+name+'.js')",'sdkImport(name)');
vm.runInContext(source,ctx);
const flush=async()=>{for(let n=0;n<8;n++)await new Promise(resolve=>setImmediate(resolve));};
function find(root,match){if(match(root))return root;for(const child of root.children||[]){const result=find(child,match);if(result)return result;}}
(async()=>{
  const parent=new Node('main');ctx.CuriousDipSocial.mount(parent,{type:'series',id:1});
  assert.equal(parent.children.length,1);assert.equal(likes.size,0);
  assert(find(parent,node=>node.className==='social-views').hidden,'Public view counts default to hidden');assert.equal(tracked,1,'Hiding public counts must not stop tracking');
  observers[0].fn([{isIntersecting:true}]);await flush();
  const root=parent.children[0],button=text=>find(root,node=>node.tag==='button'&&node.textContent===text);
  const like=button('♡ 0 likes');assert(like&&!like.disabled);await like.onclick();assert.equal(likes.size,0,'Anonymous visitors cannot like');
  await button('Sign in with Google').onclick();await flush();
  await like.onclick();assert.equal(likes.size,1);assert(likes.has('stories/series-1/likes/alice'));assert.equal(like.attributes['aria-pressed'],'true');
  await like.onclick();assert.equal(likes.size,0,'Repeated action must unlike, not duplicate');
  const form=find(root,node=>node.tag==='form'),textarea=find(form,node=>node.tag==='textarea');
  textarea.value='<img src=x onerror=alert(1)>\nA thought.';
  writeFailure=true;await form.onsubmit({preventDefault(){}});assert(textarea.value.includes('<img'),'Failed submission retains draft');
  writeFailure=false;await form.onsubmit({preventDefault(){}});assert.equal(textarea.value,'');assert.equal(storedComments.length,1);assert.equal(storedComments[0].uid,'alice');
  const comment=find(root,node=>node.tag==='li');assert(find(comment,node=>node.tag==='p'&&node.textContent.includes('<img')),'Comment markup must remain plain text');assert(!find(comment,node=>node.tag==='img'));
  await button('Delete').onclick();assert.equal(storedComments.length,1,'First click must only request confirmation');
  await button('Cancel').onclick();assert.equal(storedComments.length,1,'Cancel must retain the comment');
  await button('Delete').onclick();await button('Confirm delete').onclick();assert.equal(storedComments.length,0);
  await button('Sign out').onclick();assert(form.hidden);
  ctx.CuriousDipSocial.reset();assert(observerCalls>=2,'Route cleanup disconnects observers');
  ctx.CURIOUSDIP_FEATURES={showViews:true};const enabled=new Node('main');ctx.CuriousDipSocial.mount(enabled,{type:'blog',id:1});assert.equal(find(enabled,node=>node.className==='social-views').hidden,false,'An explicit feature flag enables the counter');ctx.CuriousDipSocial.reset();
  console.log('Social checks passed: anonymous access, account-bound likes/unlikes, safe comment text, retained drafts, delete, sign-out and route cleanup.');
})().catch(error=>{console.error(error);process.exitCode=1;});
