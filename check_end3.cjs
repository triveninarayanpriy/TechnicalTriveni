const fs = require('fs');
let lines = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8').split('\n');
let endIdx = lines.findIndex(l => l.includes('<style>'));
console.log(lines.slice(endIdx - 15, endIdx).join('\n'));
