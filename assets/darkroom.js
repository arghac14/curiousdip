'use strict';
// Backgrounds, slideshow transitions, avatars and the full-screen viewer stay immediate.
globalThis.CuriousDipDarkroom=(()=>{
  const root=document.querySelector('#main');
  const selector='.home-story-image img,.card-image img,.blog-image-frame img,.series-photo-grid img,.blog-photo img,.about-portrait img,.story-photo img';
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const visible=new WeakSet();
  const developed=new Set();
  function clear(image){image.classList.remove('darkroom-pending','darkroom-developing');image.style.removeProperty('--darkroom-delay');}
  function develop(image){
    if(!image.isConnected||motion.matches||!image.complete||!image.naturalWidth||image.classList.contains('darkroom-developing'))return;
    if(developed.has(image.currentSrc||image.src)){clear(image);return;}
    image.classList.add('darkroom-developing');
  }
  const observer='IntersectionObserver' in globalThis?new IntersectionObserver(entries=>{
    entries.forEach(({target,isIntersecting})=>{
      if(!isIntersecting)return;
      visible.add(target);observer.unobserve(target);develop(target);
    });
  },{threshold:.08}):null;
  root.addEventListener('load',event=>{if(visible.has(event.target))develop(event.target);},true);
  root.addEventListener('animationend',event=>{
    if(event.animationName!=='darkroom-develop')return;
    const image=event.target;developed.add(image.currentSrc||image.src);clear(image);
  });
  function refresh(){
    observer?.disconnect();
    root.querySelectorAll(selector).forEach((image,index)=>{
      if(!observer||motion.matches||developed.has(image.currentSrc||image.src)){clear(image);return;}
      if(image.classList.contains('darkroom-developing'))return;
      image.classList.add('darkroom-pending');
      image.style.setProperty('--darkroom-delay',`${index%4*55}ms`);
      if(visible.has(image))develop(image);else observer.observe(image);
    });
  }
  motion.addEventListener('change',refresh);
  return {refresh};
})();
