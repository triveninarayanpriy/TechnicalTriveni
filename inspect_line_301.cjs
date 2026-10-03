const fs = require('fs');
let lines = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8').split('\n');
console.log(lines.slice(290, 310).join('\n'));
