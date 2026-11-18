const fs=require('fs'),vm=require('vm'),assert=require('assert');const source=fs.readFileSync('assets/app.js','utf8');const nodes=new Map();let stops=0;
function node(selector){if(!nodes.has(selector))nodes.set(selector,{value:selector==='#sort'?'newest':'',textContent:'',innerHTML:'',hidden:false,classList:{add(){}},scrollIntoView(){this.scrolled=true;}});return nodes.get(selector);}
const items=Array.from({length:19},(_,index)=>({id:index+1,title:'Story '+(index+1),description:index===18?'Hidden needle':'Overview',overview:index===18?'Hidden needle':'Overview',date:'2026-01-'+String(20-index).padStart(2,'0'),pinned:index<2,pinOrder:index+1,genres:index%2?['Street']:['Travel']}));
const ctx=vm.createContext({URLSearchParams,Number,Set,Math,main:node('#main'),location:{hash:'#/series'},history:{replaceState(a,b,hash){ctx.location.hash=hash;}},$:node,$$:()=>[],esc:String,reducedMotion:{matches:true},content:{items:items.map(i=>({...i,type:'series'})),seriesGenres:['Travel','Street']},videoViewStops:[],publishedVideos:()=>items,videoCard:i=>`<article data-id="${i.id}"></article>`,card:i=>`<article data-id="${i.id}"></article>`,CuriousDipViews:{track(){return ()=>{stops++;};}},document:{getElementById:node},CuriousDipDarkroom:{refresh(){}},fitHomePhoto(){},itemGenres:i=>i.genres,searchText:i=>(i.title+' '+i.description).toLowerCase()});
vm.runInContext(source.slice(source.indexOf('function pagination('),source.indexOf('function homeEmpty(')),ctx);
vm.runInContext(source.slice(source.indexOf('function listing('),source.indexOf('function searchText(')),ctx);
const ids=selector=>[...node(selector).innerHTML.matchAll(/data-id="(\d+)"/g)].map(m=>Number(m[1]));
const go=page=>node('#catalog-pagination').onclick({target:{closest:()=>({dataset:{page:String(page)},disabled:false})}});
for(const type of ['series','blog','video']){
 nodes.clear();ctx.location.hash='#/'+(type==='blog'?'blogs':type==='video'?'videos':'series');ctx.content.items=items.map(i=>({...i,type}));
 vm.runInContext(type==='video'?'videosPage()':`listing('${type}')`,ctx);const result=type==='video'?'#video-results':'#results';
 assert.deepEqual(ids(result),[1,2,3,4,5,6,7,8]);assert(!node('#catalog-pagination').hidden);
 go(2);assert.deepEqual(ids(result),[9,10,11,12,13,14,15,16]);assert(ctx.location.hash.includes('page=2'));
 go(3);assert.deepEqual(ids(result),[17,18,19]);assert(node('#catalog-pagination').innerHTML.includes('Showing 17–19 of 19'));
 node('#search').value='needle';node('#search').oninput();assert.deepEqual(ids(result),[19]);assert(!ctx.location.hash.includes('page='));assert(node('#catalog-pagination').hidden);
 node('#search').value='no matching result';node('#search').oninput();assert.deepEqual(ids(result),[]);assert(node('#catalog-pagination').hidden);
 if(type!=='video'){node('#search').value='';node('#search').oninput();go(2);node('#sort').value='oldest';node('#sort').onchange();assert(!ctx.location.hash.includes('page='));assert.equal(ids(result).length,8);}
}
assert(stops>=19,'Video observers must be cleaned up between pages');
for(const [input,page]of [['-1',1],['NaN',1],['2.5',1],['999',3]])assert.equal(ctx.pagination(items,input).page,page);
assert.equal(ctx.pagination([],99).items.length,0);assert.equal(ctx.pagination(items.slice(0,8),1).pages,1);
console.log('Pagination checks passed: eight per page for all three catalogs, final page, search across all items, reset, sorting, URL state, bounds and video observer cleanup.');
