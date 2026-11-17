const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const scan = require('./presets.cjs');
const root = fs.mkdtempSync(path.join(os.tmpdir(),'curiousdip-presets-'));
const dirs = ['assets','assets/preset','assets/preset/displaypictures','assets/preset/homeBgSlideShows'];
const files = [];
function add(folder,name) {
  const file=path.join(root,'assets/preset',folder,name);
  fs.writeFileSync(file,'');files.push(file);
}
try {
  dirs.forEach(dir=>fs.mkdirSync(path.join(root,dir)));
  add('displaypictures','z-my portrait.png');
  add('displaypictures','a-new-name.jpg');
  add('displaypictures','notes.txt');
  add('homeBgSlideShows','any background #1.JPG');
  let result=scan(root);
  assert.deepStrictEqual(result.displaypictures,[
    'assets/preset/displaypictures/a-new-name.jpg',
    'assets/preset/displaypictures/z-my%20portrait.png'
  ]);
  assert.deepStrictEqual(result.homeBgSlideShows,['assets/preset/homeBgSlideShows/any%20background%20%231.JPG']);
  fs.renameSync(files[1],path.join(root,'assets/preset/displaypictures','zz-replaced.webp'));
  files[1]=path.join(root,'assets/preset/displaypictures','zz-replaced.webp');
  result=scan(root);
  assert.equal(result.displaypictures[0],'assets/preset/displaypictures/z-my%20portrait.png');
  assert.equal(result.displaypictures[1],'assets/preset/displaypictures/zz-replaced.webp');
  console.log('Preset discovery follows arbitrary filenames, renames and image extensions.');
} finally {
  files.forEach(file=>fs.unlinkSync(file));
  dirs.reverse().forEach(dir=>fs.rmdirSync(path.join(root,dir)));
  fs.rmdirSync(root);
}
