'use strict';
// Firebase is loaded only when a conversation scrolls into view or is opened.
globalThis.CuriousDipSocial=(()=>{
  const views=new Set();let backendPromise,backend;
  const make=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
  function errorText(error){
    const code=error?.code||'';
    if(code==='auth/popup-closed-by-user')return 'Sign-in was closed. You can try again.';
    if(code==='auth/popup-blocked')return 'Allow the sign-in popup in your browser, then try again.';
    if(code==='auth/unauthorized-domain')return 'Google sign-in is not configured for this domain yet.';
    if(code.includes('resource-exhausted'))return 'Conversations have reached their usage limit. Please try again later.';
    if(code.includes('permission-denied'))return 'This action could not be authorized. Please sign in again.';
    return 'Could not connect to the conversation. Please try again.';
  }
  async function connect(){
    if(!backendPromise)backendPromise=(async()=>{
      const config=globalThis.CURIOUSDIP_FIREBASE;
      if(!config?.projectId)throw Error('Not configured');
      const version='12.17.1',base='https://www.gstatic.com/firebasejs/'+version+'/';
      const [appSDK,authSDK,dbSDK]=await Promise.all(['app','auth','firestore'].map(name=>import(base+'firebase-'+name+'.js')));
      const app=appSDK.initializeApp(config),auth=authSDK.getAuth(app),db=dbSDK.getFirestore(app);
      await auth.authStateReady();
      backend={auth,db,...authSDK,...dbSDK};
      authSDK.onAuthStateChanged(auth,()=>{for(const view of views)if(view.root.isConnected)view.account();});
      return backend;
    })().catch(error=>{backendPromise=null;throw error;});
    return backendPromise;
  }
  function mount(parent,item){
    if(!parent||!Number.isSafeInteger(item.id)||!['series','blog','video'].includes(item.type))return;
    if(!globalThis.CURIOUSDIP_FIREBASE?.projectId)return;
    const root=make('section',undefined,'social-section');root.setAttribute('aria-label','Likes and comments');
    const header=make('div',undefined,'social-heading'),heading=make('h2','What caught your eye?'),actions=make('div',undefined,'social-actions');
    const like=make('button','♡ Like'),login=make('button','Sign in with Google'),status=make('p','Loading conversation…','social-status'),account=make('p','','social-account');
    like.type=login.type='button';like.setAttribute('aria-pressed','false');like.disabled=login.disabled=true;
    const list=make('ol',undefined,'social-comments'),more=make('button','Load more comments'),retry=make('button','Try again');more.hidden=retry.hidden=true;more.type=retry.type='button';
    const form=make('form',undefined,'social-form'),label=make('label','Leave a comment'),textarea=make('textarea'),submit=make('button','Post comment');
    textarea.id='comment-'+item.type+'-'+item.id;label.htmlFor=textarea.id;textarea.required=true;textarea.maxLength=2000;textarea.placeholder='What caught your eye?';submit.type='submit';form.append(label,textarea,submit);form.hidden=true;
    status.setAttribute('role','status');actions.append(like,login);header.append(heading,actions);root.append(header,account,form,status,retry,list,more);parent.append(root);
    let ready=false,busy=false,liked=false,total=0,cursor=null,hasMore=false,identityVersion=0;
    const key=item.type+'-'+item.id,path=['stories',key];
    const active=()=>root.isConnected&&views.has(view);
    const reference=(kind,id)=>id?backend.doc(backend.db,...path,kind,id):backend.collection(backend.db,...path,kind);
    const note=text=>{if(active())status.textContent=text;};
    const refreshLike=()=>{like.textContent=(liked?'♥':'♡')+' '+total+(total===1?' like':' likes');like.setAttribute('aria-pressed',String(liked));};
    const view={root,account:async()=>{
      const version=++identityVersion,user=backend?.auth.currentUser;
      login.textContent=user?'Sign out':'Sign in with Google';login.disabled=false;account.textContent=user?'Signed in as '+(user.displayName||'photography lover')+'. Your Google name will appear with your comment.': 'Read along, or sign in with Google to join in.';form.hidden=!user;
      liked=false;
      if(user&&ready)try{const result=await backend.getDoc(reference('likes',user.uid));if(version!==identityVersion||!active())return;liked=result.exists();}catch(error){note(errorText(error));}
      refreshLike();renderComments();
    }};
    views.add(view);
    let comments=[];
    function renderComments(){
      if(!active())return;list.replaceChildren();const user=backend?.auth.currentUser;
      for(const row of comments){
        const li=make('li',undefined,'social-comment'),head=make('header'),avatar=make('span',(row.name||'?').slice(0,1), 'social-avatar'),name=make('strong',row.name||'Visitor'),time=make('time');
        const date=row.createdAt?.toDate();if(date){time.dateTime=date.toISOString();time.textContent=date.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});}
        head.append(avatar,name,time);li.append(head,make('p',row.text));
        if(user&&(row.uid===user.uid||(user.emailVerified&&user.email==='01argha@gmail.com'))){
          const remove=make('button','Delete');remove.type='button';remove.setAttribute('aria-label','Delete comment by '+row.name);
          const cancel=make('button','Cancel');cancel.type='button';cancel.hidden=true;
          cancel.onclick=()=>{remove.dataset.confirming='';remove.textContent='Delete';remove.setAttribute('aria-label','Delete comment by '+row.name);cancel.hidden=true;note('Deletion cancelled.');};
          remove.onclick=async()=>{
            if(!remove.dataset.confirming){remove.dataset.confirming='true';remove.textContent='Confirm delete';remove.setAttribute('aria-label','Confirm delete comment by '+row.name);cancel.hidden=false;note('Delete this comment permanently? Choose Confirm delete or Cancel.');return;}
            remove.disabled=cancel.disabled=true;
            try{await backend.deleteDoc(reference('comments',row.id));comments=comments.filter(c=>c.id!==row.id);renderComments();note('Comment deleted.');}catch(error){note(errorText(error));remove.disabled=cancel.disabled=false;}
          };head.append(remove,cancel);
        }
        list.append(li);
      }
    }
    async function loadComments(reset=false){
      if(reset){cursor=null;comments=[];}
      const constraints=[backend.orderBy('createdAt','desc')];if(cursor)constraints.push(backend.startAfter(cursor));constraints.push(backend.limit(20));
      const result=await backend.getDocs(backend.query(reference('comments'),...constraints));if(!active())return;
      comments.push(...result.docs.map(doc=>({id:doc.id,...doc.data()})));cursor=result.docs[result.docs.length-1]||cursor;hasMore=result.size===20;more.hidden=!hasMore;renderComments();note(comments.length?'':'Be the first to leave a thought.');
    }
    async function start(){
      if(ready||busy)return;busy=true;retry.hidden=true;
      try{await connect();if(!active())return;const count=await backend.getCountFromServer(reference('likes'));if(!active())return;total=count.data().count;ready=true;like.disabled=false;await view.account();await loadComments(true);}catch(error){ready=false;like.disabled=true;login.disabled=false;note(errorText(error));retry.hidden=false;}finally{busy=false;}
    }
    login.onclick=async()=>{
      const signingOut=login.textContent==='Sign out';login.disabled=true;
      try{await connect();if(signingOut)await backend.signOut(backend.auth);else if(!backend.auth.currentUser)await backend.signInWithPopup(backend.auth,new backend.GoogleAuthProvider());await view.account();await start();}catch(error){note(errorText(error));}finally{login.disabled=false;}
    };
    like.onclick=async()=>{
      if(!backend.auth.currentUser){note('Sign in with Google to like this story.');login.focus();return;}
      like.disabled=true;
      try{const ref=reference('likes',backend.auth.currentUser.uid);const next=await backend.runTransaction(backend.db,async tx=>{const old=await tx.get(ref);if(old.exists()){tx.delete(ref);return false;}tx.set(ref,{createdAt:backend.serverTimestamp()});return true;});total=Math.max(0,total+(next&&!liked?1:!next&&liked?-1:0));liked=next;refreshLike();note(liked?'Thanks for the love.':'Like removed.');try{const count=await backend.getCountFromServer(reference('likes'));total=count.data().count;refreshLike();}catch{note('Your like preference was saved. Refresh to update the total.');}}catch(error){note(errorText(error));}finally{like.disabled=false;}
    };
    form.onsubmit=async event=>{
      event.preventDefault();if(!ready||!backend.auth.currentUser||submit.disabled)return;const text=textarea.value.trim();if(!text)return;submit.disabled=true;
      try{const user=backend.auth.currentUser;await backend.addDoc(reference('comments'),{uid:user.uid,name:user.displayName||'Visitor',text,createdAt:backend.serverTimestamp()});textarea.value='';try{await loadComments(true);note('Your comment is posted.');}catch{note('Your comment is posted. Reload to refresh the conversation.');}}catch(error){note(errorText(error)+' Your draft has been kept.');}finally{submit.disabled=false;}
    };
    more.onclick=async()=>{more.disabled=true;try{await loadComments();}catch(error){note(errorText(error));}finally{more.disabled=false;}};retry.onclick=start;
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();start();}},{rootMargin:'150px'});observer.observe(root);view.disconnect=()=>observer.disconnect();
  }
  function reset(){for(const view of views)view.disconnect();views.clear();}
  return {mount,reset};
})();
