'use strict';
globalThis.CuriousDipLoader=(()=>{
  let finished=false;
  async function openingPhotos(){
    const images=[...document.querySelectorAll('#main img')].filter(image=>{
      if(image.closest('.home-backdrop,.slide:not(.active)'))return false;
      const rect=image.getBoundingClientRect();return rect.top<innerHeight&&rect.bottom>0;
    });
    // Content images should not hold the whole site hostage on a slow remote host.
    let timer;
    try{await Promise.race([Promise.allSettled(images.map(image=>image.decode())),new Promise(resolve=>{timer=setTimeout(resolve,6000);})]);}
    finally{clearTimeout(timer);}
  }
  function finish(){
    if(finished)return;finished=true;
    document.body.classList.remove('is-initializing');
    document.querySelectorAll('[data-boot-inert]').forEach(element=>{element.inert=false;element.removeAttribute('data-boot-inert');});
    document.querySelector('#main').setAttribute('aria-busy','false');
    const loader=document.querySelector('#boot-loader');if(!loader)return;
    loader.setAttribute('aria-hidden','true');loader.classList.add('is-ready');
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)loader.remove();else setTimeout(()=>loader.remove(),350);
  }
  return {openingPhotos,finish};
})();
