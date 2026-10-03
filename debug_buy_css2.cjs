const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
const start = c.indexOf('  /* CTA buy / free card */');
console.log(c.substring(start, start + 300));
