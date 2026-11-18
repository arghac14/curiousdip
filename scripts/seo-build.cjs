const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
module.exports=function buildSEO(output){
  const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name+'.json'),'utf8'));
  const raw={profile:read('profile'),presets:read('presets'),photoseries:read('photoseries'),blog:read('blog'),videos:read('videos')},config=read('seo');
  const site=new URL(config.siteUrl);if(site.protocol!=='https:'||site.search||site.hash)throw Error('SEO siteUrl must be a public HTTPS base URL');
  const nodes=new Map();
  function node(selector){if(!nodes.has(selector))nodes.set(selector,{innerHTML:'',textContent:'',value:selector==='#sort'?'newest':'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){},contains(){return false;}},addEventListener(){},setAttribute(){},getAttribute(){return ''},querySelector:node,querySelectorAll(){return []}});return nodes.get(selector);}
  const document={baseURI:config.siteUrl,querySelector:node,querySelectorAll(){return []},getElementById:node,addEventListener(){},body:node('body'),documentElement:node('html')};
  document.documentElement.dataset.theme='dark';
  const context=vm.createContext({document,URL,URLSearchParams,console,innerHeight:900,scrollY:0,location:{origin:site.origin,hash:'',protocol:'https:'},history:{replaceState(){}},matchMedia:()=>({matches:true,addEventListener(){}}),setInterval(){},clearInterval(){},setTimeout(){},localStorage:{getItem(){return null;}},CuriousDipDarkroom:{refresh(){}},CuriousDipViews:{track(){return ()=>{};}},CuriousDipSocial:{reset(){}}});
  context.window={addEventListener(){}};
  for(const file of ['assets/data.js','assets/seo.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
  const app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
  vm.runInContext(app.slice(0,app.indexOf("$('#year').textContent")),context);
  context.raw=raw;vm.runInContext('content=CuriousDipData.normalize(raw,()=>0);',context);
  const template=fs.readFileSync(path.join(output,'index.html'),'utf8');
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const routes=['/','/series','/blogs','/videos','/about','/contact',...raw.photoseries.filter(row=>!row.isDeleted).map(row=>'/series/'+row.id),...raw.blog.filter(row=>!row.isDeleted).map(row=>'/blogs/'+row.id)];
  const urls=[];
  for(const route of routes){
    nodes.clear();context.location.hash='#'+route;
    // main is captured by the renderer; retain it across each page.
    const main=vm.runInContext('main',context);main.innerHTML='';
    const parts=route.split('/').filter(Boolean);
    const render=!parts.length?'home()':route==='/series'?"listing('series')":route==='/blogs'?"listing('blog')":route==='/videos'?'videosPage()':route==='/about'?'about()':route==='/contact'?'contact()':`detail(content.items.find(i=>i.type==='${parts[0]==='series'?'series':'blog'}'&&i.id===${Number(parts[1])}))`;
    vm.runInContext(render,context);
    let content=main.innerHTML;
    for(const [selector,element]of nodes){if(!selector.startsWith('#'))continue;const id=selector.slice(1);if(element.innerHTML)content=content.replace(new RegExp(`(<[^>]+id="${id}"[^>]*>)(</)`),(_,open,close)=>open+element.innerHTML+close);if(element.textContent)content=content.replace(new RegExp(`(<[^>]+id="${id}"[^>]*>)(</)`),(_,open,close)=>open+escape(element.textContent)+close);}
    const meta=context.CuriousDipSEO.describe(route,raw,config),base=parts.length?'../'.repeat(parts.length):'./';
    const head=`<base href="${base}"><meta name="curiousdip-route" content="${escape(route)}">\n<title>${escape(meta.title)}</title><meta name="description" content="${escape(meta.description)}"><meta name="author" content="${escape(raw.profile.name)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${escape(meta.url)}">\n<meta property="og:site_name" content="CuriousDip"><meta property="og:locale" content="en_IN"><meta property="og:type" content="${meta.type}"><meta property="og:title" content="${escape(meta.title)}"><meta property="og:description" content="${escape(meta.description)}"><meta property="og:url" content="${escape(meta.url)}"><meta property="og:image" content="${escape(meta.image)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(meta.title)}"><meta name="twitter:description" content="${escape(meta.description)}"><meta name="twitter:image" content="${escape(meta.image)}"><script id="seo-schema" type="application/ld+json">${JSON.stringify(meta.schema).replace(/</g,'\\u003c')}</script><script>window.CURIOUSDIP_SEO_CONFIG=${JSON.stringify(config).replace(/</g,'\\u003c')}</script>\n`;
    let html=template.replace(/<title>[\s\S]*?<\/title>/,'').replace(/<meta name="description"[^>]*>/,'').replace('<head>','<head>\n'+head).replace(/(<main\b[^>]*>)[\s\S]*?<\/main>/,(_,open)=>open+content+'</main>');
    // Only real page links change; in-page skip links and external links stay intact.
    html=html.replace(/href="#\/([^"?]*)"/g,(_,part)=>`href="${base+part+(part?'/':'')}" data-route="/${part}"`);
    html=html.replace('body class="is-initializing"',`body class="is-initializing${route==='/'?' is-home':route==='/contact'?' is-contact':''}"`);
    const directory=path.join(output,...parts);fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'index.html'),html);urls.push(meta.url);
  }
  fs.writeFileSync(path.join(output,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(url=>'<url><loc>'+escape(url)+'</loc></url>').join('')+'</urlset>\n');
  fs.writeFileSync(path.join(output,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+new URL('sitemap.xml',config.siteUrl).href+'\n');
  console.log(`SEO: generated ${routes.length} crawlable pages, metadata, structured data and sitemap.`);
};
