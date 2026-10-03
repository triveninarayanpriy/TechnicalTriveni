const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
const t = fs.readFileSync('target1.txt', 'utf8').replace(/\\r\\n/g, '\\n');
const r = fs.readFileSync('replace1.txt', 'utf8').replace(/\\r\\n/g, '\\n');

if (c.includes('buy-card')) {
  console.log('File has buy-card');
}
