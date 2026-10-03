const fs = require('fs');
const html = fs.readFileSync('drone_live2.html', 'utf8');

// find where container detail starts
const idx = html.indexOf('container dp');
console.log(html.slice(idx, idx + 2000));
