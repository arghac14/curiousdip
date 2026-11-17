const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const ctx=vm.createContext({URL});
vm.runInContext(fs.readFileSync('assets/data.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('data/preview-data.js','utf8').replace('window.','globalThis.'),ctx);
const raw=JSON.parse(JSON.stringify(ctx.CURIOUSDIP_PREVIEW));
for(const name of ['photoseries','blog','videos']) {
  assert.deepStrictEqual(raw[name],JSON.parse(fs.readFileSync('data/'+name+'.json','utf8')));
  const ids=new Set();
  for(const row of raw[name]) {
    assert(Number.isSafeInteger(row.id)&&row.id>0&&!ids.has(row.id),'Unique positive numeric IDs required within each collection');ids.add(row.id);
    assert(row.title&&typeof row.subtext==='string'&&Number.isFinite(Date.parse(row.createdAt)));
    assert(typeof row.isPinned==='boolean'&&typeof row.isSelectedStories==='boolean'&&typeof row.isDeleted==='boolean');
    if(name==='videos')assert(ctx.CuriousDipData.youtubeID(row.video),'Valid HTTPS YouTube URL required');
    else {assert(Array.isArray(row.photos));for(const url of row.photos)assert(ctx.CuriousDipData.image(url).url===url,'Invalid photo URL');}
    if(name==='blog')assert(typeof row.content==='string');
    if(name==='photoseries')assert(row.genres.every(g=>['Festival','Street','Travel','Portraits','Documentary'].includes(g)));
  }
  assert(raw[name].filter(row=>!row.isDeleted&&row.isPinned).length<=4,'At most four active pins per collection');
  assert(raw[name].filter(row=>!row.isDeleted&&row.isSelectedStories).length<=3,'At most three active selections per collection');
}
for(const folder of Object.values(raw.presets))for(const file of folder)assert(fs.existsSync(decodeURIComponent(file)),'Preset missing: '+file);
const data=ctx.CuriousDipData.normalize(raw,()=>0);
assert.equal(data.profile.portrait.url,raw.presets.displaypictures[0]);
assert.equal(data.profile.aboutSections.length,3);
assert.equal(data.homeBackgrounds[0].url,raw.presets.homeBgSlideShows[0]);
assert.deepStrictEqual(Array.from(data.items.filter(i=>i.type==='series'&&i.pinned),i=>i.id),raw.photoseries.filter(i=>i.isPinned).map(i=>i.id));
assert.deepStrictEqual(Array.from(data.items.filter(i=>i.type==='blog'&&i.featured).slice(0,3),i=>i.id),raw.blog.filter(i=>i.isSelectedStories).slice(0,3).map(i=>i.id));
const article=data.items.find(i=>i.type==='blog');
assert.equal(article.openingImages.length,3);
assert.deepStrictEqual(Array.from(article.blocks,b=>b.type),['paragraph','paragraph','image','paragraph','paragraph','image']);
assert.equal(ctx.CuriousDipData.image('javascript:alert(1)').url,'assets/dynamic/sample-portrait.svg');
assert.equal(ctx.CuriousDipData.youtubeID('https://evil.example/watch?v=aqz-KE-bpKQ'),'');
const more=JSON.parse(JSON.stringify(raw));more.presets.displaypictures=['assets/preset/displaypictures/01.png','assets/preset/displaypictures/02.png','assets/preset/displaypictures/03.png'];more.presets.homeBgSlideShows=['a','assets/preset/homeBgSlideShows/b.png'];
const mapped=ctx.CuriousDipData.normalize(more,()=>0.99);
assert.equal(mapped.profile.aboutSections[0].image.url,more.presets.displaypictures[1]);
assert.equal(mapped.profile.aboutSections[1].image.url,more.presets.displaypictures[2]);
assert.equal(mapped.homeBackgrounds[0].url,more.presets.homeBgSlideShows[1]);
assert.equal(ctx.CuriousDipData.pickBackground(mapped.backgroundPresets,()=>0)[0].url,mapped.backgroundPresets[0].url);
assert.equal(ctx.CuriousDipData.pickBackground(mapped.backgroundPresets,()=>0.99)[0].url,mapped.backgroundPresets[1].url);
assert.equal(ctx.CuriousDipData.pickBackground([]).length,0);
let picks=0;
const plan=ctx.CuriousDipData.planBackgrounds(mapped.backgroundPresets,()=>picks++%2?0.99:0);
assert.equal(picks,6,'Assign all six page backgrounds once');
assert.equal(plan['/'][0].url,mapped.backgroundPresets[0].url);
assert.equal(plan['/series'][0].url,mapped.backgroundPresets[1].url);
const deleted=JSON.parse(JSON.stringify(raw));
deleted.photoseries[0].isDeleted=true;deleted.blog[0].isDeleted=true;deleted.videos[0].isDeleted=true;
const hidden=ctx.CuriousDipData.normalize(deleted,()=>0);
assert(!hidden.items.some(row=>row.type==='series'&&row.id===deleted.photoseries[0].id),'Deleted series must not reach listings or detail routes');
assert(!hidden.items.some(row=>row.type==='blog'&&row.id===deleted.blog[0].id),'Deleted blogs must not reach detail routes');
assert(!hidden.videos.some(row=>row.id===deleted.videos[0].id),'Deleted videos must not reach Home or Videos');
const priority=JSON.parse(JSON.stringify(raw));priority.photoseries[0].pinOrder=4;priority.photoseries[0].selectedStoryOrder=3;
const ranked=ctx.CuriousDipData.normalize(priority,()=>0).items.find(row=>row.type==='series'&&row.id===priority.photoseries[0].id);
assert.equal(ranked.pinOrder,4);assert.equal(ranked.featureOrder,3);
console.log('Data mapping, flags, IDs, article layout, preset selection and URL checks passed.');
