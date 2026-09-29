const fs = require('fs');
let c = fs.readFileSync('src/components/StageCard.astro', 'utf8');
c = c.replace(/    <h3 class="stage-card__title">{step\.title\.replace.*\\n  <\\/div>\\n/, '');
fs.writeFileSync('src/components/StageCard.astro', c);
