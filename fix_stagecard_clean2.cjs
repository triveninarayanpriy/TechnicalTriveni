const fs = require('fs');
let c = fs.readFileSync('src/components/StageCard.astro', 'utf8');
const target = "    <h3 class=\"stage-card__title\">{step.title.replace(/^Stage \\d+ ?\" /, '')}</h3>\n  </div>\n";
c = c.replace(target, '');
fs.writeFileSync('src/components/StageCard.astro', c);
