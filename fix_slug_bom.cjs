const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
c = c.replace('<BomTable items={project.bom} />', '<BomTable items={project.bom} overrideTotal={project.cost_override} />');
fs.writeFileSync('src/pages/projects/[slug].astro', c);