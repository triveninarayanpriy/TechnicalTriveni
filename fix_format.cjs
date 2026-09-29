const fs = require('fs');
let c = fs.readFileSync('src/lib/format.ts', 'utf8');
c = c.replace(/return \\\\?\\\$\\{INR\.format/g, 'return String.fromCharCode(8377) + INR.format');
c = c.replace(/return \\\?\\$\\{INR\.format/, 'return String.fromCharCode(8377) + INR.format');
fs.writeFileSync('src/lib/format.ts', c);
