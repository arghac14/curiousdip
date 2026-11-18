const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),output=path.resolve(root,'dist');
// This generated directory is the only removal target; never follow a symlink.
if(output!==path.join(root,'dist')||!output.startsWith(root+path.sep))throw Error('Unsafe build output');
if(fs.existsSync(output)){
  if(fs.lstatSync(output).isSymbolicLink())throw Error('Build output cannot be a symlink');
  fs.rmSync(output,{recursive:true,force:false});
}
fs.mkdirSync(output);
function copy(source,destination){
  const stat=fs.lstatSync(source);if(stat.isSymbolicLink())throw Error('Symlinks are not deployable');
  if(stat.isDirectory()){fs.mkdirSync(destination,{recursive:true});for(const entry of fs.readdirSync(source))if(!entry.startsWith('.'))copy(path.join(source,entry),path.join(destination,entry));}
  else fs.copyFileSync(source,destination);
}
// Allowlist: the local admin, scripts, credentials and repository metadata never deploy.
for(const file of ['index.html','assets','data'])copy(path.join(root,file),path.join(output,file));
fs.writeFileSync(path.join(output,'.nojekyll'),'');
require('./seo-build.cjs')(output);
console.log('Static portfolio built in dist/ (admin excluded).');
