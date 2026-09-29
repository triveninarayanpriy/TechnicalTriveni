const fs = require('fs');
let c = fs.readFileSync('src/components/BomTable.astro', 'utf8');
c = c.replace(/triveni_bom_state/g, 'triveni_bom_v2');
fs.writeFileSync('src/components/BomTable.astro', c);
