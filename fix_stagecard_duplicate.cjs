const fs = require('fs');
let lines = fs.readFileSync('src/components/StageCard.astro', 'utf8').split('\n');
let newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<h3 class="stage-card__title">{step.title.replace(/^Stage \\d+ — /, \'\')}</h3>')) {
    // Skip this line and the next </div>
    i++; 
    continue;
  }
  newLines.push(lines[i]);
}
fs.writeFileSync('src/components/StageCard.astro', newLines.join('\n'));
