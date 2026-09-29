const fs = require('fs');
let c = fs.readFileSync('src/pages/projects/[slug].astro', 'utf8');

c = c.replace(/<table class="bom">[\s\S]*?<\/table>/, '<BomTable items={project.bom} overrideTotal={displayCost} />');

const imports = "import BomTable from '../../components/BomTable.astro';\nimport StageCard from '../../components/StageCard.astro';\nimport TroubleTable from '../../components/TroubleTable.astro';";
c = c.replace(/import Icon from '\.\.\/\.\.\/components\/Icon\.astro';/, "import Icon from '../../components/Icon.astro';\n" + imports);

fs.writeFileSync('src/pages/projects/[slug].astro', c);
