const fs = require('fs');
let c = fs.readFileSync('src/components/StageCard.astro', 'utf8');
c = c.replace("    </div>\n  </div>\n    <h3 class=\"stage-card__title\">{step.title.replace(/^Stage \\d+ ?\" /, '')}</h3>\n  </div>", "    </div>\n  </div>");
fs.writeFileSync('src/components/StageCard.astro', c);
