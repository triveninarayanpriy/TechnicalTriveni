const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');
c = c.replace(/import BomTable from '..\/..\/components\/BomTable\.astro';\nimport BomTable from '..\/..\/components\/BomTable\.astro';/, "import BomTable from '../../components/BomTable.astro';");
fs.writeFileSync('src/pages/projects/[slug].astro', c);
