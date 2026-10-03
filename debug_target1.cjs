const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
let t = fs.readFileSync('target1.txt', 'utf8');

console.log('t starts with:', t.slice(0, 100));
console.log('c has cta-card?:', c.includes('cta-card'));
