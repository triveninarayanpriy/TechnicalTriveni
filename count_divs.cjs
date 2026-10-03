const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
let open = (c.match(/<div/g) || []).length;
let close = (c.match(/<\/div>/g) || []).length;
console.log('Open:', open, 'Close:', close);
