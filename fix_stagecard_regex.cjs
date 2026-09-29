const fs = require('fs');
let c = fs.readFileSync('src/components/StageCard.astro', 'utf8');
c = c.replace(/<\/div>\r?\n\s*<h3 class="stage-card__title">\{step\.title\.replace\([^}]+\)<\/h3>\r?\n\s*<\/div>/g, '</div>');
fs.writeFileSync('src/components/StageCard.astro', c);
