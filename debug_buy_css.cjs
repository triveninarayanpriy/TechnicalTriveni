const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
const buyCss = c.substring(c.indexOf('  /* CTA buy / free card */'), c.indexOf('  .facts { padding: 1.25rem; }'));
console.log(buyCss.length);
