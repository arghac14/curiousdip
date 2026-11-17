'use strict';
// Adapt simple public JSON to the approved rendering components.
globalThis.CuriousDipData = (() => {
  const fallback = 'assets/dynamic/sample-portrait.svg';
  function image(url, alt='Photograph') {
    const local = typeof url==='string' && /^assets\/(?:preset|dynamic)\//.test(url) && !url.includes('..') && !url.includes('\\');
    let remote=false;
    try { remote=new URL(url).protocol==='https:'; } catch {}
    return {provider:remote?'remote':'local',url:local||remote?url:fallback,alt,caption:''};
  }
  function youtubeID(value) {
    try {
      const url=new URL(value);
      if(url.protocol!=='https:')return '';
      let id='';
      if(url.hostname==='youtu.be')id=url.pathname.slice(1);
      if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(url.hostname))id=url.searchParams.get('v')||url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]||'';
      return /^[\w-]{11}$/.test(id)?id:'';
    } catch { return ''; }
  }
  function pickBackground(images, random=Math.random) {
    return images.length?[images[Math.floor(random()*images.length)]]:[];
  }
  function planBackgrounds(images, random=Math.random) {
    return Object.fromEntries(['/','/series','/blogs','/videos','/about','/contact'].map(page=>[page,pickBackground(images,random)]));
  }
  function normalize(raw, random=Math.random) {
    const portraits=raw.presets.displaypictures;
    const portrait=image(portraits[0],raw.profile.name);
    const aboutPhotos=portraits.slice(1);
    const backgrounds=raw.presets.homeBgSlideShows;
    function item(row,index,type) {
      const photos=(row.photos.length?row.photos:[fallback]).map((url,i)=>image(url,`${row.title} — photograph ${i+1}`));
      const blocks=(row.content||'').split(/\n\s*\n/).map(text=>text.trim()).filter(Boolean).map(text=>({type:'paragraph',text}));
      // Temporary article layout, pending the CMS content format.
      if(type==='blog') {
        const split=Math.ceil(blocks.length/2);
        if(photos[3])blocks.splice(split,0,{type:'image',image:photos[3]});
        if(photos[4])blocks.push({type:'image',image:photos[4]});
        photos.slice(5).forEach(photo=>blocks.push({type:'image',image:photo}));
      }
      return {...row,type,description:row.subtext,date:row.createdAt.slice(0,10),tags:[],genres:row.genres||[],status:'published',pinned:row.isPinned,pinOrder:row.pinOrder??index+1,featured:row.isSelectedStories,featureOrder:row.selectedStoryOrder??index,cover:photos[0],photos,openingImages:photos.slice(0,3),blocks,readMinutes:Math.max(1,Math.ceil((row.content||'').split(/\s+/).length/200))};
    }
    return {
      profile:{...raw.profile,portrait,aboutSections:raw.profile.aboutSections.map((section,index)=>({...section,image:image(aboutPhotos.length?aboutPhotos[index%aboutPhotos.length]:portraits[0],raw.profile.name)}))},
      backgroundPresets:backgrounds.map(url=>image(url,'')),
      homeBackgrounds:pickBackground(backgrounds.map(url=>image(url,'')),random),
      pageBackgrounds:planBackgrounds(backgrounds.map(url=>image(url,'')),random),
      seriesGenres:['Festival','Street','Travel','Portraits','Documentary'],
      items:[...raw.photoseries.filter(row=>!row.isDeleted).map((row,i)=>item(row,i,'series')),...raw.blog.filter(row=>!row.isDeleted).map((row,i)=>item(row,i,'blog'))],
      videos:raw.videos.filter(row=>!row.isDeleted).map((row,index)=>({...row,overview:row.subtext,youtubeId:youtubeID(row.video),status:'published',pinned:row.isPinned,pinOrder:row.pinOrder??index+1,featured:row.isSelectedStories,featureOrder:row.selectedStoryOrder??index}))
    };
  }
  return {normalize,image,youtubeID,pickBackground,planBackgrounds};
})();
