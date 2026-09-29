const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
c = c.replace('.detail__side { position: sticky; top: calc(var(--header-h) + 1rem); display: flex; flex-direction: column; gap: 1.25rem; }', 
'.detail__side { /* removed sticky per request */ display: flex; flex-direction: column; gap: 1.25rem; }');
fs.writeFileSync('src/pages/projects/[slug].astro', c);
