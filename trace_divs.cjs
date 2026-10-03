const fs = require('fs');
let lines = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8').split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
  let open = (lines[i].match(/<div/g) || []).length;
  let close = (lines[i].match(/<\/div>/g) || []).length;
  depth += open - close;
  if (depth < 0) console.log('Depth negative at', i+1);
}
console.log('Final depth:', depth);
