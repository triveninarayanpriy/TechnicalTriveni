const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
const lines = c.split('\n');
const newLines = [];
let seenBom = false;
let seenStage = false;
let seenTrouble = false;

for (let line of lines) {
  if (line.includes('import BomTable')) {
    if (seenBom) continue;
    seenBom = true;
  }
  if (line.includes('import StageCard')) {
    if (seenStage) continue;
    seenStage = true;
  }
  if (line.includes('import TroubleTable')) {
    if (seenTrouble) continue;
    seenTrouble = true;
  }
  newLines.push(line);
}
fs.writeFileSync('src/pages/projects/[slug].astro', newLines.join('\n'));
