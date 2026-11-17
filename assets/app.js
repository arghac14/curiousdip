'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const main = $('#main');
function fitHomePhoto(image) {
  if(image.matches('.home-slideshow .slide-photo img, .home-story-image img, .blog-image-frame img, .series-grid .card-image img, .series-photo-grid img, .blog-photo img') && image.naturalWidth && image.naturalHeight) {
    image.dataset.orientation=image.naturalWidth>image.naturalHeight?'landscape':'portrait';
  }
}
main.addEventListener('error',event=>{
  const image=event.target;
  if(image instanceof HTMLImageElement&&!image.dataset.fallback){image.dataset.fallback='true';image.src=image.closest('.video-thumbnail')?'assets/dynamic/sample-landscape.svg':'assets/dynamic/sample-portrait.svg';}
},true);
main.addEventListener('load',event=>{if(event.target instanceof HTMLImageElement)fitHomePhoto(event.target);},true);
$('.skip').addEventListener('click', event => { event.preventDefault(); main.focus(); main.scrollIntoView(); });
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let content, slideTimer, slideIndex = 0, slideshowPaused = reducedMotion.matches, gallery = [], photoIndex = 0, lastFocus;
const date = value => new Date(value + 'T12:00:00').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'});
function imageURL(image, width = 1200) {
  try {
    if(image.provider==='local') {
      if(!/^assets\/(?:preset|dynamic)\//.test(image.url) || image.url.includes('..') || image.url.includes('\\'))return '';
      const url=new URL(image.url,document.baseURI);
      return url.origin===location.origin ? url.href : '';
    }
    const url = new URL(image.url); if (url.protocol !== 'https:') return ''; if (url.hostname === 'images.unsplash.com') url.searchParams.set('w', width); return url.href;
  } catch { return ''; }
}
function picture(image, cls = '', eager = false, width = 1200) {
  return `<img class="${cls}" src="${esc(imageURL(image, width))}" alt="${esc(image.alt)}" loading="${eager?'eager':'lazy'}" decoding="async" ${eager?'fetchpriority="high"':''}>`;
}
function profilePhoto(cls='') {
  return `<img class="profile-photo ${cls}" src="${esc(imageURL(content.profile.portrait))}" alt="${esc(content.profile.portrait.alt)}" loading="lazy">`;
}
function link(item) { return `#/${item.type==='series'?'series':'blogs'}/${item.id}`; }
function typeLabel(item) { return item.type === 'blog' ? 'Journal / Blog' : 'Photo series'; }
function itemGenres(item){return item.type==='series'?(item.genres||[]):item.tags;}
function card(item, index = 0, pinned = false, showCategory = false) {
  if(item.type==='blog') {
    const previews=item.previewImages?.length?item.previewImages:[item.cover,...item.blocks.filter(b=>b.type==='image').map(b=>b.image)].slice(0,2);
    return `<article class="story-card blog-card"><div class="blog-copy"><div class="blog-author">${profilePhoto()}<div><span>${esc(content.profile.name)}</span><small>${date(item.date)} · ${item.readMinutes} min read${pinned?' · Pinned':''}</small></div></div>${showCategory?`<p class="blog-category">${esc(item.tags[0])}${pinned?' <span>↗ Pinned</span>':''}</p>`:""}<h3><a href="${link(item)}">${esc(item.title)}</a></h3><p class="blog-excerpt">${esc(item.description)}</p><a class="blog-read" href="${link(item)}">Read story <span>↗</span></a></div><a class="blog-visual" href="${link(item)}" aria-label="Read ${esc(item.title)}">${previews.map(img=>`<span class="blog-image-frame">${picture(img,'',index<2)}</span>`).join('')}</a></article>`;
  }
  return `<article class="story-card"><a class="card-image" href="${link(item)}">${picture(item.cover, '', index < 2)}<span class="image-arrow" aria-hidden="true">↗</span>${pinned?'<span class="pin-badge">↗ Pinned</span>':''}</a><div class="card-meta"><span>${esc(itemGenres(item).join(' / '))}</span><span>${item.type==='blog'?item.readMinutes+' min read':'Photo series'}</span></div><h3><a href="${link(item)}">${esc(item.title)}</a></h3><p>${esc(item.description)}</p><span class="card-date">${date(item.date)}</span></article>`;
}
function sectionHeading(kicker, title, href, label) { return `<div class="section-heading"><div><p class="eyebrow">${kicker}</p><h2>${title}</h2></div>${href?`<a class="text-link" href="${href}">${label} <span>↗</span></a>`:''}</div>`; }
function publishedVideos(){return (content.videos||[]).filter(video=>video.status==='published'&&/^[\w-]{11}$/.test(video.youtubeId)).sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||(a.pinned&&b.pinned?a.pinOrder-b.pinOrder:0));}
function videoThumbnail(video){return `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;}
function videoCard(video){return `<article class="home-video-card"><a class="video-thumbnail" href="#/videos?watch=${encodeURIComponent(video.id)}" aria-label="Watch ${esc(video.title)}"><img src="${videoThumbnail(video)}" alt="${esc(video.title)} — video thumbnail" loading="lazy"><span class="video-play" aria-hidden="true">▶</span></a><div class="video-card-copy"><h4><a href="#/videos?watch=${encodeURIComponent(video.id)}">${esc(video.title)}</a></h4><p>${esc(video.overview)}</p></div></article>`;}
function videosPage(){
  const videos=publishedVideos();
  main.innerHTML=`<div class="listing-intro-surface"><div class="home-backdrop" aria-hidden="true"></div><section class="page-intro wrap"><p class="eyebrow">STORIES IN MOTION</p><h1>A different<br>way of <em>seeing.</em></h1><p>Moving images, longer moments, and stories worth sitting with.</p></section></div><section class="videos-list wrap" aria-label="Videos">${videos.map((video,index)=>`<article class="video-entry" id="video-${esc(video.id)}"><div class="video-player">${location.protocol==='file:'?`<a class="video-thumbnail" href="https://www.youtube.com/watch?v=${video.youtubeId}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${esc(video.title)} on YouTube"><img src="${videoThumbnail(video)}" alt="${esc(video.title)}" loading="lazy"><span class="video-play" aria-hidden="true">▶</span></a>`:`<iframe src="https://www.youtube-nocookie.com/embed/${video.youtubeId}" title="${esc(video.title)} — YouTube player" width="560" height="315" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`}</div><div class="video-overview"><h2>${esc(video.title)}</h2><p>${esc(video.overview)}</p><a class="text-link" href="https://www.youtube.com/watch?v=${video.youtubeId}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>${location.protocol==='file:'?'<p class="video-sample-note">For embedded playback, open this site through the local HTTP preview.</p>':''}</div></article>`).join('')||'<p class="empty-state">New videos are on their way.</p>'}</section>`;
}
function home() {
  const slides = content.items.filter(i=>i.type==='series'&&i.pinned).sort((a,b)=>a.pinOrder-b.pinOrder).slice(0,4);
  const featured = content.items.filter(i=>i.featured).sort((a,b)=>a.featureOrder-b.featureOrder);
  const featuredSeries=featured.filter(i=>i.type==='series').slice(0,3);
  const featuredBlogs=featured.filter(i=>i.type==='blog').slice(0,3);
  const featuredVideos=publishedVideos().filter(video=>video.featured).sort((a,b)=>a.featureOrder-b.featureOrder).slice(0,3);
  main.innerHTML = `<div class="home-surface"><div class="home-backdrop" aria-hidden="true"></div><section class="home-hero wrap" aria-label="Introduction and selected photographs"><div class="home-identity"><div class="home-profile"><div class="home-avatar">${profilePhoto()}</div><h1>A curious way<br>of <em>seeing.</em></h1></div><p class="home-author">${esc(content.profile.name)}</p><p class="home-bio">${esc(content.profile.intro)}</p><a class="text-link" href="#/about">A little about me <span>↗</span></a></div>
    <section class="slideshow home-slideshow" aria-label="Selected photo series" aria-roledescription="carousel"><div class="slide-stage">${slides.map((s,i)=>`<a class="slide ${i===0?'active':''}" href="${link(s)}" ${i!==0?'inert':''} aria-label="${esc(s.title)}"><div class="slide-photo">${picture(s.cover,'',i===0,1400)}</div><div class="slide-caption"><h2>${esc(s.title)}</h2><p class="slide-overview">${esc(s.description)}</p></div></a>`).join('')}</div><div class="home-slide-toolbar"><div class="slide-dots">${slides.map((s,i)=>`<button class="${i===0?'active':''}" data-slide="${i}" aria-label="Show slide ${i+1}: ${esc(s.title)}" aria-pressed="${i===0}"></button>`).join('')}</div><div class="slide-controls"><span id="slide-count">${slides.length?'01':'00'} / ${String(slides.length).padStart(2,'0')}</span><button id="slide-pause" aria-label="${slideshowPaused?'Play':'Pause'} slideshow">${slideshowPaused?'▶':'Ⅱ'}</button><button id="slide-prev" aria-label="Previous slide">←</button><button id="slide-next" aria-label="Next slide">→</button></div></div></section></section>
    </div><section class="section home-selected wrap">${sectionHeading('A FEW THINGS TO SPEND TIME WITH','Selected <em>stories.</em>')}
      <section class="home-story-section" aria-labelledby="home-series-title"><div class="home-row-heading"><h3 id="home-series-title">Photo Series</h3><a class="text-link" href="#/series">All photo series ↗</a></div><div class="home-stories-grid">${featuredSeries.map(item=>`<article class="home-story-card"><a class="home-story-image" href="${link(item)}" aria-label="Explore ${esc(item.title)}">${picture(item.cover)}</a><div class="home-story-copy"><h4><a href="${link(item)}">${esc(item.title)}</a></h4><p>${esc(item.description)}</p><a class="home-story-link" href="${link(item)}">View series ↗</a></div></article>`).join('')}</div></section>
      <section class="home-story-section" aria-labelledby="home-blogs-title"><div class="home-row-heading"><h3 id="home-blogs-title">Blogs</h3><a class="text-link" href="#/blogs">All blogs ↗</a></div><div class="home-blog-row">${featuredBlogs.map((item,index)=>card(item,index,false,false)).join('')}</div></section>
      <section class="home-story-section" aria-labelledby="home-videos-title"><div class="home-row-heading"><h3 id="home-videos-title">Videos</h3><a class="text-link" href="#/videos">All videos ↗</a></div><div class="home-video-row">${featuredVideos.map(videoCard).join('')}</div></section>
      <p class="demo-note">A work in progress · Sample stories, stock photographs & sample video links shown for layout exploration.</p></section>
    <section class="contact-strip wrap"><p class="eyebrow">LET’S MAKE A CONNECTION</p><h2>A story to share?<br><a href="#/contact">I’m all <em>ears.</em> ↗</a></h2></section>`;
  slideIndex=0;
  $$('.home-slideshow .slide-photo img, .home-story-image img, .home-blog-row .blog-image-frame img').forEach(fitHomePhoto);
  $('#slide-next').onclick=()=>{showSlide(slideIndex+1); restartSlides();};
  $('#slide-prev').onclick=()=>{showSlide(slideIndex-1); restartSlides();};
  $('#slide-pause').onclick=()=>{slideshowPaused=!slideshowPaused; syncPause(); restartSlides();};
  $$('.slide-dots button').forEach(b=>b.onclick=()=>{showSlide(Number(b.dataset.slide));restartSlides();});
  restartSlides();
}
function syncPause() { const button=$('#slide-pause'); if(button){button.textContent=slideshowPaused?'▶':'Ⅱ';button.setAttribute('aria-label',`${slideshowPaused?'Play':'Pause'} slideshow`);} }
function showSlide(index) {
  const slides=$$('.slide'); if(!slides.length) return;
  slideIndex=(index+slides.length)%slides.length;
  slides.forEach((s,i)=>{s.classList.toggle('active',i===slideIndex);s.inert=i!==slideIndex;});
  $$('.slide-dots button').forEach((s,i)=>{s.classList.toggle('active',i===slideIndex);s.setAttribute('aria-pressed',String(i===slideIndex));});
  $('#slide-count').textContent=`${String(slideIndex+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
}
function restartSlides() { clearInterval(slideTimer); if(!slideshowPaused&&!document.hidden&&$$('.slide').length>1) slideTimer=setInterval(()=>showSlide(slideIndex+1),3000); }
document.addEventListener('visibilitychange',()=>{clearInterval(slideTimer);if($('.slideshow'))restartSlides();});
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){slideshowPaused=true;syncPause();clearInterval(slideTimer);}});
function listing(type) {
  const items=content.items.filter(i=>i.type===type), isBlog=type==='blog';
  const filters=isBlog?['All']:['All',...content.seriesGenres];
  const params=new URLSearchParams(location.hash.split('?')[1]||'');
  main.innerHTML=`<div class="listing-intro-surface"><div class="home-backdrop" aria-hidden="true"></div><section class="page-intro wrap"><p class="eyebrow">${isBlog?'THE JOURNAL':'COLLECTED THROUGH THE LENS'}</p><h1>${isBlog?'Words, walks<br>& <em>wonderings.</em>':'One frame.<br>A thousand <em>stories.</em>'}</h1><p>${isBlog?'Notes on photography, the creative process, and the things that stay with us.':'Places, passing moments, and the threads that connect them. A collection of photo series.'}</p></section></div><section class="listing wrap"><div class="listing-tools"><label class="search-field"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="Search ${isBlog?'blogs':'photo series'}…" aria-label="Search titles and content" value="${esc(params.get('q')||'')}"><kbd>/</kbd></label><label class="sort-field">Sort by <select id="sort"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select></label></div>${isBlog?'':`<div class="tag-row" role="group" aria-label="${isBlog?'Filter by topic':'Filter by genre'}">${filters.map(tag=>`<button data-tag="${esc(tag)}" aria-pressed="false">${esc(tag)}</button>`).join('')}</div>`}<div class="results-heading"><span id="result-count" role="status"></span><span>PINNED STORIES APPEAR FIRST ↗</span></div><div id="results" class="listing-grid"></div><p class="demo-note">Sample content · Stock photographs are used as placeholders, not as Arghadip’s portfolio.</p></section>`;
  let tag=params.get('tag')||'All';
  if(isBlog)$('#results').classList.add('blogs-grid');
  else $('#results').classList.add('series-grid');
  if(!filters.includes(tag))tag='All';
  if(['newest','oldest','title'].includes(params.get('sort')))$('#sort').value=params.get('sort');
  function renderResults() {
    const query=$('#search').value.trim().toLowerCase();
    const filtered=items.filter(i=>(tag==='All'||itemGenres(i).includes(tag))&&searchText(i).includes(query));
    const pins=items.filter(i=>i.pinned).sort((a,b)=>a.pinOrder-b.pinOrder).slice(0,4).map(i=>i.id);
    const ordered=[...filtered].sort((a,b)=>{const ap=pins.includes(a.id),bp=pins.includes(b.id);if(ap!==bp)return ap?-1:1;if(ap&&bp)return a.pinOrder-b.pinOrder;return $('#sort').value==='title'?a.title.localeCompare(b.title):$('#sort').value==='oldest'?a.date.localeCompare(b.date):b.date.localeCompare(a.date);});
    $('#results').innerHTML=ordered.length?ordered.map((i,n)=>card(i,n,pins.includes(i.id))).join(''):'<div class="empty-state"><h2>No stories found.</h2><p>Try another word or clear your filters.</p><button id="clear-filters" class="button">Clear filters ↗</button></div>';
    $$('.blogs-grid .blog-image-frame img').forEach(fitHomePhoto);
    $$('.series-grid .card-image img').forEach(fitHomePhoto);
    CuriousDipDarkroom.refresh();
    $('#result-count').textContent=`${ordered.length} ${isBlog?'blog'+(ordered.length===1?'':'s'):'photo series'}${query?' matching “'+$('#search').value.trim()+'”':''}`;
    $$('.tag-row button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tag===tag)));
    const p=new URLSearchParams();if(query)p.set('q',$('#search').value.trim());if(tag!=='All')p.set('tag',tag);if($('#sort').value!=='newest')p.set('sort',$('#sort').value);
    history.replaceState(null,'',`#/${isBlog?'blogs':'series'}${p.toString()?'?'+p:''}`);
    if($('#clear-filters'))$('#clear-filters').onclick=()=>{$('#search').value='';tag='All';renderResults();};
  }
  $('#search').oninput=renderResults;$('#sort').onchange=renderResults;
  $$('.tag-row button').forEach(b=>b.onclick=()=>{tag=b.dataset.tag;renderResults();});renderResults();
}
function searchText(item) { return [item.title,item.description,...item.tags,...(item.genres||[]),...item.blocks.flatMap(b=>[b.text||'',...(b.items||[]),b.image?.caption||'',b.image?.alt||'',...(b.images||[]).flatMap(i=>[i.alt,i.caption])])].join(' ').toLowerCase(); }
function photoBlock(image, note, cls='') {
  const index=gallery.push(image)-1;
  return `<figure class="story-photo ${cls}"><button class="photo-open" data-photo="${index}" aria-label="Enlarge: ${esc(image.alt)}">${picture(image)}<span>View photograph ↗</span></button><figcaption>${esc(image.caption)}</figcaption>${note?`<details class="frame-note"><summary>Behind the frame <span>+</span></summary><p>${esc(note)}</p></details>`:''}</figure>`;
}
function blogPhoto(image, opening=false){
  const index=gallery.push(image)-1;
  return `<figure class="blog-photo ${opening?'blog-opening-photo':'blog-inline-photo'}"><button data-photo="${index}" aria-label="Enlarge: ${esc(image.alt)}">${picture(image,'',opening)}</button></figure>`;
}
function detail(item) {
  if(item.type==='series'){seriesDetail(item);return;}
  gallery=[];
  main.innerHTML=`<div class="reading-progress" aria-hidden="true"></div><article class="blog-article wrap"><header class="blog-detail-title"><h1>${esc(item.title)}</h1></header><div class="blog-opening-grid" aria-label="Opening photographs">${(item.openingImages||[]).map(image=>blogPhoto(image,true)).join('')}</div><div class="blog-detail-content">${item.blocks.map(block=>{switch(block.type){case'paragraph':return `<p class="blog-text">${esc(block.text)}</p>`;case'heading':return `<h2 class="blog-text">${esc(block.text)}</h2>`;case'quote':return `<blockquote class="blog-text">${esc(block.text)}</blockquote>`;case'list':return `<ul class="blog-text">${block.items.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>`;case'image':return blogPhoto(block.image);case'gallery':return `<div class="blog-inline-gallery">${block.images.map(image=>blogPhoto(image)).join('')}</div>`;default:return '';}}).join('')}</div></article>`;
  $$('.blog-photo img').forEach(fitHomePhoto);
  $$('[data-photo]').forEach(button=>button.onclick=()=>openPhoto(Number(button.dataset.photo),button));
  updateProgress();
}
function seriesDetail(item){
  gallery=item.photos||[];
  main.innerHTML=`<section class="series-detail wrap"><header class="series-detail-header"><h1>${esc(item.title)}</h1><p>${esc(item.description)}</p></header><div class="series-photo-grid" aria-label="${esc(item.title)} photographs">${gallery.map((image,index)=>`<button class="series-photo" data-photo="${index}" aria-label="Enlarge: ${esc(image.alt)}">${picture(image,'',index<4)}</button>`).join('')}</div></section>`;
  $$('.series-photo-grid img').forEach(fitHomePhoto);
  $$('.series-photo').forEach(button=>button.onclick=()=>openPhoto(Number(button.dataset.photo),button));
}
function about() {
  const sections=content.profile.aboutSections||[];
  const row=(section,index)=>`<section class="about-row ${index%2?'about-row-reversed':''}"><figure class="about-portrait">${picture(section.image,'',index===0)}</figure><div class="about-story"><h2>${esc(section.title)}</h2>${section.paragraphs.map(text=>`<p>${esc(text)}</p>`).join('')}</div></section>`;
  main.innerHTML=`<div class="listing-intro-surface about-surface"><div class="home-backdrop" aria-hidden="true"></div><section class="page-intro wrap about-intro"><p class="eyebrow">Welcome to my world</p><h1>Always curious. Always <em>looking.</em></h1></section><div class="about-rows about-first-rows wrap">${sections.slice(0,1).map((section,index)=>row(section,index)).join('')}</div></div><div class="about-rows about-remaining wrap">${sections.slice(1).map((section,index)=>row(section,index+1)).join('')}</div>`;
}
function contact() {
  main.innerHTML=`<div class="listing-intro-surface"><div class="home-backdrop" aria-hidden="true"></div><section class="contact-page wrap"><p class="eyebrow">GOOD THINGS BEGIN WITH A HELLO</p><h1>Let’s start<br>a <em>conversation.</em></h1><p class="lead">Have a story in mind, a collaboration idea, or a question about a photograph? I’d love to hear from you.</p><div class="contact-method"><div><span class="eyebrow">WRITE TO ME</span><a class="email-address" href="mailto:${esc(content.profile.email)}">${esc(content.profile.email)} ↗</a></div><button id="copy-email" class="round-button" aria-label="Copy email address">⧉</button></div><div class="contact-method"><div><span class="eyebrow">FOLLOW THE CURIOSITY</span><a class="email-address" href="${esc(content.profile.instagram)}" target="_blank" rel="noopener noreferrer">${esc(content.profile.handle)} ↗</a></div><span class="contact-label">INSTAGRAM</span></div></section></div><section class="email-section wrap"><div><p class="eyebrow">A CONVERSATION STARTS HERE</p><h2>Have something<br>in <em>mind?</em></h2><p>A question, an idea, or simply a hello.<br>I’d love to hear from you.</p><a class="text-link" href="mailto:${esc(content.profile.email)}">${esc(content.profile.email)} ↗</a></div><form id="email-form"><div class="form-row"><label>Your name<input name="name" autocomplete="name" required maxlength="100" placeholder="How should I call you?"></label><label>Your email<input name="email" type="email" autocomplete="email" required maxlength="200" placeholder="you@example.com"></label></div><label>Subject<input name="subject" required maxlength="150" placeholder="What’s on your mind?"></label><label>Your message<textarea name="message" rows="5" required maxlength="4000" placeholder="Tell me a little about it…"></textarea></label><button class="button" type="submit">Open email draft <span>↗</span></button><p class="form-note">Opens your email app with a prepared message. Review and send it there; this website does not send or store your message.</p><p id="form-status" role="status"></p></form></section>`;
  $('#copy-email').onclick=e=>copyText(content.profile.email,e.currentTarget,'✓');
  $('#email-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);const body=`Hello Arghadip,\n\n${f.get('message')}\n\n${f.get('name')}\nReply to: ${f.get('email')}`;location.href=`mailto:${encodeURIComponent(content.profile.email)}?subject=${encodeURIComponent(f.get('subject'))}&body=${encodeURIComponent(body)}`;$('#form-status').textContent='Your email app should open. If it doesn’t, email 01argha@gmail.com directly. Your message remains here.';};
}
async function copyText(text, button, success) { const label=button.textContent;try{await navigator.clipboard.writeText(text);button.textContent=success;$('#announcement').textContent='Copied to clipboard';setTimeout(()=>{if(button.isConnected)button.textContent=label;},2200);}catch{button.textContent='Copy unavailable';$('#announcement').textContent='Clipboard unavailable. Select and copy the address or browser URL manually.';} }
function openPhoto(index, trigger) {photoIndex=index;lastFocus=trigger;renderPhoto();$('#lightbox').showModal();document.body.classList.add('modal-open');}
function renderPhoto(){const image=gallery[photoIndex];$('#lightbox img').src=imageURL(image,2400);$('#lightbox img').alt=image.alt;$('#lightbox figcaption').textContent=`${photoIndex+1} / ${gallery.length} — ${image.caption||image.alt}`;}
function closePhoto(){$('#lightbox').close();}
$('.lightbox-close').onclick=closePhoto;
$('.lightbox-prev').onclick=()=>{photoIndex=(photoIndex-1+gallery.length)%gallery.length;renderPhoto();};
$('.lightbox-next').onclick=()=>{photoIndex=(photoIndex+1)%gallery.length;renderPhoto();};
$('#lightbox').addEventListener('close',()=>{document.body.classList.remove('modal-open');lastFocus?.focus();});
$('#lightbox').addEventListener('click',e=>{if(e.target===$('#lightbox'))closePhoto();});
document.addEventListener('keydown',e=>{if($('#lightbox').open){if(e.key==='ArrowRight')$('.lightbox-next').click();if(e.key==='ArrowLeft')$('.lightbox-prev').click();return;}if(e.key==='/'&&$('#search')&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('#search').focus();}if(e.key==='Escape')closeMenu();});
function updateProgress(){const bar=$('.reading-progress');if(!bar)return;const article=$('article',main);const total=article.offsetTop+article.offsetHeight-innerHeight;bar.style.width=`${Math.min(100,Math.max(0,scrollY/Math.max(1,total)*100))}%`;}
window.addEventListener('scroll',updateProgress,{passive:true});
function closeMenu(){$('.menu-button').setAttribute('aria-expanded','false');$('#navigation').classList.remove('open');}
$('.menu-button').onclick=()=>{const open=$('.menu-button').getAttribute('aria-expanded')!=='true';$('.menu-button').setAttribute('aria-expanded',String(open));$('#navigation').classList.toggle('open',open);};
const themeButton=$('.theme-toggle');
function themeLabel(){const dark=document.documentElement.dataset.theme==='dark';const label=`Switch to ${dark?'light':'dark'} theme`;themeButton.setAttribute('aria-label',label);themeButton.setAttribute('title',label);themeButton.setAttribute('aria-pressed',String(dark));}
function applyTheme(){document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('curiousdip-theme',document.documentElement.dataset.theme);}catch{}themeLabel();}
themeButton.onclick=()=>{
  if(themeButton.classList.contains('is-switching'))return;
  if(reducedMotion.matches){applyTheme();return;}
  themeButton.classList.add('is-switching');
  setTimeout(applyTheme,270);
  setTimeout(()=>themeButton.classList.remove('is-switching'),600);
};themeLabel();
// Hold decoded Image elements so route changes never refetch or decode backgrounds.
const backgroundImages=new Map();
async function prepareBackgrounds() {
  const selected=[...new Map(Object.values(content.pageBackgrounds).flat().map(image=>[image.url,image])).values()];
  async function load(image) {
    const node=new Image();node.className='home-background-slide active';node.alt='';node.decoding='async';node.src=imageURL(image,1800);
    await node.decode();return node;
  }
  const results=await Promise.allSettled(selected.map(load));
  results.forEach((result,index)=>{if(result.status==='fulfilled')backgroundImages.set(selected[index].url,result.value);});
  let fallback=backgroundImages.values().next().value;
  if(selected.length&&!fallback)fallback=await load(CuriousDipData.image('assets/dynamic/sample-landscape.svg',''));
  selected.forEach(image=>{if(!backgroundImages.has(image.url))backgroundImages.set(image.url,fallback);});
}
function route(focus=true){
  clearInterval(slideTimer);closeMenu();if($('#lightbox').open)closePhoto();
  const path=location.hash.slice(1).split('?')[0]||'/';const parts=path.split('/').filter(Boolean);

  document.body.classList.toggle('is-home',parts.length===0);
  document.body.classList.toggle('is-contact',path==='/contact');
  $$('#navigation a').forEach(a=>{const active=parts[0]?(a.hash==='#/'+parts[0]):a.hash==='#/';if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  let title='A curious way of seeing';
  if(!parts.length)home();
  else if(path==='/videos'){videosPage();title='Videos';}
  else if(['blogs','series'].includes(parts[0])&&parts.length===1){listing(parts[0]==='blogs'?'blog':'series');title=parts[0]==='blogs'?'Blogs':'Photo series';}
  else if(['blogs','series'].includes(parts[0])&&parts.length===2){let key;try{key=decodeURIComponent(parts[1]);}catch{key='';}const type=parts[0]==='blogs'?'blog':'series';const item=/^[1-9]\d*$/.test(key)?content.items.find(i=>i.type===type&&i.id===Number(key)):null;if(item){detail(item);title=item.title;}else notFound();}
  else if(path==='/about'){about();title='About Arghadip';}else if(path==='/contact'){contact();title='Contact';}else notFound();
  const background=content.pageBackgrounds[path]?.[0];
  const backdrop=$('.home-backdrop');
  if(backdrop&&background){const image=backgroundImages.get(background.url);if(image)backdrop.replaceChildren(image);}
  $$('.blog-image-frame img').forEach(fitHomePhoto);
  document.title=title+' — CuriousDip';
  $('meta[name="description"]').content=parts.length===2?content.items.find(i=>link(i)==='#'+path)?.description||'CuriousDip — photographs and field notes.':'Photographs, stories, and a little curiosity. A journal by Arghadip Chakraborty.';
  window.scrollTo({top:0,behavior:'instant'});if(focus)main.focus({preventScroll:true});
  CuriousDipDarkroom.refresh();
  if(path==='/videos'){const watch=new URLSearchParams(location.hash.split('?')[1]||'').get('watch');if(watch)document.getElementById('video-'+watch)?.scrollIntoView({behavior:'instant',block:'start'});}
}
function notFound(){main.innerHTML='<section class="page-intro wrap"><p class="eyebrow">404 / A SMALL DETOUR</p><h1>This story is<br>still <em>unwritten.</em></h1><p>The page you’re looking for isn’t here.</p><a class="text-link" href="#/">Back to the beginning ↗</a></section>';}
$('#year').textContent=new Date().getFullYear();
const loadData = location.protocol==='file:'
  ? Promise.resolve().then(()=>{if(!window.CURIOUSDIP_PREVIEW)throw Error('Missing direct-file preview data. Run npm run photos.');return window.CURIOUSDIP_PREVIEW;})
  : Promise.all(['profile','photoseries','blog','videos','presets'].map(name=>fetch('./data/'+name+'.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(name+' could not be loaded.');return r.json();}))).then(([profile,photoseries,blog,videos,presets])=>({profile,photoseries,blog,videos,presets}));
loadData.then(async data=>{content=CuriousDipData.normalize(data);await prepareBackgrounds();const footerEmail=$('footer a[href^="mailto:"]');if(footerEmail)footerEmail.href='mailto:'+content.profile.email;const footerInstagram=$('footer a[href*="instagram.com"]');if(footerInstagram)footerInstagram.href=content.profile.instagram;route(false);await CuriousDipLoader.openingPhotos();window.addEventListener('hashchange',()=>route());}).catch(error=>{console.error('CuriousDip initialization:',error);main.innerHTML='<section class="page-intro wrap"><h1>A brief pause.</h1><p>The data could not load. Run npm run photos, then refresh your preview.</p></section>';}).finally(()=>CuriousDipLoader.finish());
