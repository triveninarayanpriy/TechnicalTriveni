const fs = require('fs');
let c = fs.readFileSync('src/components/BomTable.astro', 'utf8');
c = c.replace(/<td class="mono bom-total-val" id="bom-core-total">--<\/td>\n        <td><\/td>/g, '<td class="mono bom-total-val" id="bom-core-total" colspan="2">--</td>');
c = c.replace(/<td class="mono bom-total-val" id="bom-dynamic-total"([^>]+)>--<\/td>\n        <td><\/td>/g, '<td class="mono bom-total-val" id="bom-dynamic-total" colspan="2">--</td>');
fs.writeFileSync('src/components/BomTable.astro', c);
