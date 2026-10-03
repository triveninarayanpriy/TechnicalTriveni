const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
c = c.replace('  </div>\n</div>\n\n  {paid && paymentsOn && (', '  </div>\n\n  {paid && paymentsOn && (');
fs.writeFileSync('src/pages/projects/[slug].astro', c);
