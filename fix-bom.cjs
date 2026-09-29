const fs = require('fs');
let c = fs.readFileSync('src/components/BomTable.astro', 'utf8');
c = c.replace(/\"\?\" \+/g, '\"₹\" +');
fs.writeFileSync('src/components/BomTable.astro', c);
