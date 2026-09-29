const fs = require('fs');
let c = fs.readFileSync('src/components/BomTable.astro', 'utf8');

c = c.replace('interface Props {', 'interface Props {\n  overrideTotal?: number;');
c = c.replace('const { items } = Astro.props;', 'const { items, overrideTotal = 0 } = Astro.props;');
c = c.replace('id="bom-interactive"', 'id="bom-interactive" data-override={overrideTotal}');

c = c.replace('function recalc() {', unction recalc() {
      const overrideVal = parseInt(table.getAttribute('data-override') || '0', 10););

c = c.replace(/if \(coreEl\) coreEl\.textContent = String\.fromCharCode\(8377\) \+ coreSum\.toLocaleString\("en-IN"\);/g, 
  'if (coreEl) coreEl.textContent = String.fromCharCode(8377) + (overrideVal > 0 ? overrideVal : coreSum).toLocaleString("en-IN");');

c = c.replace(/if \(totalEl\) totalEl\.textContent = String\.fromCharCode\(8377\) \+ selSum\.toLocaleString\("en-IN"\);/g, 
  'if (totalEl) totalEl.textContent = String.fromCharCode(8377) + (overrideVal > 0 ? overrideVal : selSum).toLocaleString("en-IN");');

fs.writeFileSync('src/components/BomTable.astro', c);
