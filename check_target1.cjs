const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
let t1 = fs.readFileSync('target1.txt', 'utf8');
console.log('Target1 exists?', c.includes(t1));
