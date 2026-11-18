const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const config=JSON.parse(fs.readFileSync('data/seo.json','utf8'));
const base=new URL(config.siteUrl),sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
assert(urls.length>=6);assert.equal(new Set(urls).size,urls.length);
for(const url of urls){
  assert(url.startsWith(base.href)&&!url.includes('#'));
  const relative=new URL(url).pathname.slice(base.pathname.length);
  const html=fs.readFileSync(path.join('dist',relative,'index.html'),'utf8');
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert(html.includes('rel="canonical" href="'+url+'"'));
  assert(html.includes('property="og:title"')&&html.includes('name="twitter:card"'));
  assert(!/<a\b[^>]*href="#\//.test(html),'Initial links must be crawlable');
  assert(/<main\b[^>]*>[\s\S]*?<h1>/.test(html),'Real content must exist before JavaScript');
  const schema=JSON.parse(html.match(/id="seo-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert(schema['@graph'].some(node=>node['@type']==='Person'&&node.name==='Arghadip Chakraborty'));
  assert(schema['@graph'].some(node=>node.url===url));
}
const series=JSON.parse(fs.readFileSync('data/photoseries.json','utf8'));
for(const row of series){const expected=new URL('series/'+row.id+'/',base).href;assert.equal(urls.includes(expected),!row.isDeleted);if(!row.isDeleted){const html=fs.readFileSync('dist/series/'+row.id+'/index.html','utf8');assert(html.includes(row.title));assert(html.includes(row.photos[0]));}}
const about=fs.readFileSync('dist/about/index.html','utf8');assert(about.includes('currently based in Bengaluru, originally from West Bengal'));
const sandbox=vm.createContext({URL});vm.runInContext(fs.readFileSync('assets/seo.js','utf8'),sandbox);
const raw={profile:{name:'Test',instagram:'https://www.instagram.com/curious.dip/'},presets:{displaypictures:['assets/preset/displaypictures/test.jpg']},photoseries:[],blog:[{id:99,title:'A <test> story',subtext:'An overview',photos:['https://example.com/photo.jpg'],createdAt:'2026-01-01',content:'A paragraph.\n\nAnother paragraph.'}]};
const article=sandbox.CuriousDipSEO.describe('/blogs/99',raw,config);assert.equal(article.type,'article');assert(article.schema['@graph'].some(node=>node['@type']==='BlogPosting'&&node.articleBody===raw.blog[0].content));
assert(!sandbox.CuriousDipSEO.describe('/blogs/100',raw,config).valid);
console.log(`SEO checks passed: ${urls.length} static pages, canonical links, social metadata, schema, visible content and soft-deleted exclusions.`);
