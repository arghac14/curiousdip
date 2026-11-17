const fs = require('fs');
const path = require('path');

// Discover files by extension, never by a specific photo name.
module.exports = function scanPresets(root = path.resolve(__dirname, '..')) {
  function images(folder) {
    return fs.readdirSync(path.join(root, folder), {withFileTypes:true})
      .filter(entry => entry.isFile() && /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(entry.name))
      .map(entry => entry.name).sort((a,b)=>a.localeCompare(b, 'en', {numeric:true}))
      .map(name=>folder+'/'+encodeURIComponent(name));
  }
  return {
    displaypictures: images('assets/preset/displaypictures'),
    homeBgSlideShows: images('assets/preset/homeBgSlideShows')
  };
};
