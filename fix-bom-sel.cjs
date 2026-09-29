const fs = require('fs');
let c = fs.readFileSync('src/components/BomTable.astro', 'utf8');

c = c.replace('if (totalEl) totalEl.textContent = String.fromCharCode(8377) + (overrideVal > 0 ? overrideVal : selSum).toLocaleString("en-IN");',
'if (totalEl) totalEl.textContent = String.fromCharCode(8377) + (overrideVal > 0 ? overrideVal : selSum).toLocaleString("en-IN");');

// Wait, I will just leave it. If they uncheck it will say 10000, maybe they want it hardcoded.
// Actually let's change it so checked items is STILL selSum.
c = c.replace('if (totalEl) totalEl.textContent = String.fromCharCode(8377) + (overrideVal > 0 ? overrideVal : selSum).toLocaleString("en-IN");',
'if (totalEl) totalEl.textContent = String.fromCharCode(8377) + selSum.toLocaleString("en-IN");');

fs.writeFileSync('src/components/BomTable.astro', c);
