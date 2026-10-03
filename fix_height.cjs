const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
c = c.replace('<aside class="proj-sidebar" style="grid-area: sidebar;">', '<aside class="proj-sidebar" style="grid-area: sidebar; height: 100%;">');
fs.writeFileSync('src/pages/projects/[slug].astro', c);
