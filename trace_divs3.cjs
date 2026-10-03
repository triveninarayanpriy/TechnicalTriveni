const fs = require('fs');
let lines = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8').split('\n');
let depth = 0;
let stack = [];
for (let i = 0; i < lines.length; i++) {
  let l = lines[i];
  let m;
  let regex = /<div|<\/div>/g;
  while ((m = regex.exec(l)) !== null) {
    if (m[0] === '<div') {
      depth++;
      stack.push({line: i+1, text: l.trim()});
    } else {
      depth--;
      stack.pop();
    }
  }
}
stack.forEach(s => console.log('Line ' + s.line + ':', s.text));
