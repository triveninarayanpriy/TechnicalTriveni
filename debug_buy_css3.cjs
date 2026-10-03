const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
const start = c.indexOf('  .buy-card { padding: 1.5rem; }');
console.log(c.substring(start, start + 300));
