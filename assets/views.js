'use strict';
// An anonymous Firebase session identifies a browser without Google sign-in or fingerprinting.
globalThis.CuriousDipViews=(()=>{
  let backendPromise;
  const recorded=new Map();
  const preview=['localhost','127.0.0.1','[::1]'].includes(location.hostname)||location.protocol==='file:';
  async function connect(){
    if(!backendPromise)backendPromise=(async()=>{
      const config=globalThis.CURIOUSDIP_FIREBASE,base='https://www.gstatic.com/firebasejs/12.17.1/';
      const [appSDK,authSDK,dbSDK]=await Promise.all(['app','auth','firestore'].map(name=>import(base+'firebase-'+name+'.js')));
      // Keep this session separate from the visitor's Google account used for comments.
      const app=appSDK.initializeApp(config,'curiousdip-views'),auth=authSDK.getAuth(app),db=dbSDK.getFirestore(app);
      if(!preview){
        await authSDK.setPersistence(auth,authSDK.browserLocalPersistence);
        await auth.authStateReady();
        if(!auth.currentUser)await authSDK.signInAnonymously(auth);
      }
      return {auth,db,...dbSDK};
    })().catch(error=>{backendPromise=null;throw error;});
    return backendPromise;
  }
  async function count(item){
    const sdk=await connect(),key=item.type+'-'+item.id,collection=sdk.collection(sdk.db,'stories',key,'views');
    if(!preview){
      const uid=sdk.auth.currentUser?.uid;if(!uid)throw Error('Visitor storage unavailable');
      const token=key+'/'+uid;
      if(!recorded.has(token)){
        const ref=sdk.doc(collection,uid);
        const record=sdk.runTransaction(sdk.db,async transaction=>{
          const current=await transaction.get(ref);
          if(!current.exists())transaction.set(ref,{createdAt:sdk.serverTimestamp()});
        }).catch(error=>{recorded.delete(token);throw error;});
        recorded.set(token,record);
      }
      await recorded.get(token);
    }
    const total=await sdk.getCountFromServer(collection);
    return total.data().count;
  }
  function mount(output,item,visibilityTarget){
    let cancelled=false,observer;
    output.textContent='— views';output.title='Unique browsers. Repeat visits in the same browser count once.'+(preview?' Local previews are not counted.':'');
    const run=()=>{if(cancelled)return;return count(item).then(total=>{
      if(cancelled||!output.isConnected)return;
      output.textContent=total+' '+(total===1?'view':'views');output.setAttribute('aria-label',total+' unique '+(total===1?'view':'views'));
    }).catch(()=>{if(!cancelled)output.title='View count is temporarily unavailable.';});};
    if(visibilityTarget){observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.25)){observer.disconnect();run();}},{threshold:.25});observer.observe(visibilityTarget);}
    else run();
    return ()=>{cancelled=true;observer?.disconnect();};
  }
  return {mount};
})();
