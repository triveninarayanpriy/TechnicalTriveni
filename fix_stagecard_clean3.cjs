const fs = require('fs');
let lines = fs.readFileSync('src/components/StageCard.astro', 'utf8').split('\n');
lines = lines.filter((_, i) => i !== 20 && i !== 21);
fs.writeFileSync('src/components/StageCard.astro', lines.join('\n'));
