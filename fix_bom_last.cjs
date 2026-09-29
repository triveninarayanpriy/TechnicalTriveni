const fs = require('fs');
let c = fs.readFileSync('src/components/BomTable.astro', 'utf8');

c = c.replace(
  'if (coreEl) coreEl.textContent = String.fromCharCode(8377) + (overrideVal > 0 ? overrideVal : coreSum).toLocaleString("en-IN");',
  'if (coreEl) coreEl.textContent = String.fromCharCode(8377) + (overrideVal > 0 ? overrideVal : coreSum).toLocaleString("en-IN");'
);

c = c.replace(
  'if (totalEl) totalEl.textContent = String.fromCharCode(8377) + (overrideVal > 0 ? overrideVal : selSum).toLocaleString("en-IN");',
  'if (totalEl) totalEl.textContent = String.fromCharCode(8377) + (overrideVal > 0 ? overrideVal : selSum).toLocaleString("en-IN");'
);

fs.writeFileSync('src/components/BomTable.astro', c);
