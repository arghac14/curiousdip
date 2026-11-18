'use strict';
// Shared by the static page builder and the browser: one source of metadata.
globalThis.CuriousDipSEO=(()=>{
  function describe(route,raw,config){
    const base=config.siteUrl.replace(/\/?$/,'/'),url=new URL(route==='/'?'':route.replace(/^\//,'')+'/',base).href;
    const person=raw.profile.name,brand=config.name,city=config.location;
    const titles={'/':`${person} | Travel & Festival Photographer | ${brand}`,'/series':`Photo Series | Travel & Festival Photography | ${brand}`,'/blogs':`Photography Stories & Travel Blogs | ${brand}`,'/videos':`Travel & Festival Films | ${brand}`,'/about':`About ${person} | Photographer in ${city} | ${brand}`,'/contact':`Contact ${person} | Photographer in ${city} | ${brand}`};
    const descriptions={'/':`${brand} is ${person}’s photography portfolio. Explore travel, festival and documentary photographs, films and stories from India. Based in ${city}.`,'/series':`Explore ${person}’s photo series: festivals, street life, travel, portraits and documentary stories from India.`,'/blogs':`Photography stories and personal travel essays by ${person}. Slow journeys, small details and the stories behind the photographs.`,'/videos':`Watch travel and festival films by ${person} on ${brand}. Explore rituals, places and everyday stories from India.`,'/about':`Meet ${person}, the photographer behind ${brand}, based in ${city}. Read about slow travel, curiosity and the stories behind his photographs.`,'/contact':`Contact ${person} in ${city} for photography collaborations, travel stories and festival photography enquiries. Connect with ${brand}.`};
    if(config.originallyFrom)descriptions['/about']=`Meet ${person}, the photographer behind ${brand}. Currently based in ${city}, originally from ${config.originallyFrom}. Explore his photographs and stories.`;
    const match=route.match(/^\/(series|blogs)\/([1-9]\d*)$/),collection=match&&(match[1]==='series'?raw.photoseries:raw.blog);
    const item=collection&&collection.find(row=>!row.isDeleted&&String(row.id)===match[2]);
    const title=item?`${item.title} | ${person} | ${brand}`:titles[route]||`Page not found | ${brand}`;
    const description=item?item.subtext:descriptions[route]||'This page could not be found.';
    const image=new URL(item?.photos?.[0]||raw.presets.displaypictures[0]||'assets/favicon.svg',base).href;
    const personId=base+'#photographer';
    const identity={'@type':'Person','@id':personId,name:person,alternateName:['curiousdip','curious.dip','CuriousDip'],url:base,image:new URL(raw.presets.displaypictures[0]||'assets/favicon.svg',base).href,jobTitle:'Photographer',description:`Travel, festival and documentary photographer based in ${city}, India.${config.originallyFrom?` Originally from ${config.originallyFrom}.`:""}`,homeLocation:{'@type':'Place',name:`${city}, ${config.region}, ${config.country}`},sameAs:[raw.profile.instagram,raw.profile.youtube].filter(Boolean)};
    const page={'@type':route==='/about'?'ProfilePage':route==='/contact'?'ContactPage':item&&match[1]==='blogs'?'BlogPosting':item?'CollectionPage':'WebPage','@id':url,url,name:title,description,inLanguage:'en',isPartOf:{'@id':base+'#website'},about:{'@id':personId}};
    if(route==='/about')page.mainEntity={'@id':personId};
    if(item){page.author={'@id':personId};page.image=item.photos;page.datePublished=item.createdAt;if(match[1]==='blogs'){page.headline=item.title;page.articleBody=item.content;}else page.hasPart=item.photos.map((photo,index)=>({'@type':'ImageObject',contentUrl:photo,name:`${item.title} — photograph ${index+1}`,creator:{'@id':personId}}));}
    const graph=[identity,{'@type':'WebSite','@id':base+'#website',url:base,name:brand,alternateName:['curious.dip','curiousdip'],publisher:{'@id':personId}},page];
    return {title,description,image,url,type:item&&match[1]==='blogs'?'article':'website',valid:!!(titles[route]||item),schema:{'@context':'https://schema.org','@graph':graph}};
  }
  function update(route,raw,config){
    const meta=describe(route,raw,config);document.title=meta.title;
    const set=(selector,value)=>{const node=document.querySelector(selector);if(node)node.setAttribute('content',value);};
    set('meta[name="description"]',meta.description);set('meta[name="robots"]',meta.valid?'index,follow,max-image-preview:large':'noindex,follow');
    for(const [key,value]of Object.entries({title:meta.title,description:meta.description,image:meta.image,url:meta.url,type:meta.type}))set(`meta[property="og:${key}"]`,value);
    set('meta[name="twitter:title"]',meta.title);set('meta[name="twitter:description"]',meta.description);set('meta[name="twitter:image"]',meta.image);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href',meta.url);
    const schema=document.querySelector('#seo-schema');if(schema)schema.textContent=JSON.stringify(meta.schema);
    // Real hrefs are crawlable; click interception keeps the existing SPA experience.
    document.querySelectorAll('a[href^="#/"]').forEach(a=>{const path=a.getAttribute('href').slice(1);a.dataset.route=path;a.href=new URL(path==='/'?'':path.slice(1).replace(/\/?$/,'/'),document.baseURI).href;});
  }
  return {describe,update};
})();
