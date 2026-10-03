const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

const buyCssStart = c.indexOf('  .buy-card { padding: 1.5rem; }');
const factsStart = c.indexOf('  .facts {', buyCssStart);

const buyCss = c.substring(buyCssStart, factsStart);

const r1 = fs.readFileSync('replace1.txt', 'utf8').replace(/\\r\\n/g, '\\n');
const newCtaCss = r1.substring(r1.indexOf('  /* CTA buy / free card */'), r1.indexOf('  /* Facts bar */'));

if (buyCssStart !== -1 && factsStart !== -1 && newCtaCss) {
  c = c.replace(buyCss, newCtaCss);
}

fs.writeFileSync('src/pages/projects/[slug].astro', c);
