const fs = require('fs');
let c = fs.readFileSync('src/components/BomTable.astro', 'utf8');
c = c.replace(/\"[^a-zA-Z]*\" \+ coreSum/g, 'String.fromCharCode(8377) + coreSum');
c = c.replace(/\"[^a-zA-Z]*\" \+ selSum/g, 'String.fromCharCode(8377) + selSum');
fs.writeFileSync('src/components/BomTable.astro', c);
