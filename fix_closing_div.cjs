const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
c = c.replace('      </aside>', '      </div>\n    </aside>');
fs.writeFileSync('src/pages/projects/[slug].astro', c);
