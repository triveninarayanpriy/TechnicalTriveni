const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
c = c.replace(/\\\\n/g, '\\n');
fs.writeFileSync('src/pages/projects/[slug].astro', c);
