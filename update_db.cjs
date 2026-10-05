const fs = require('fs');
let content = fs.readFileSync('src/lib/db.ts', 'utf8');

const updateBomFunc = `
export async function updateBom(db: D1Database, id: number, b: Partial<BomItem>) {
  const fields = ['name', 'qty', 'notes', 'store', 'affiliate_url', 'unit_price_inr', 'price_checked', 'is_affiliate', 'component_id', 'is_required', 'group_name', 'stage_tag', 'sort'];
  const sets = [];
  const binds = [];
  for (const f of fields) {
    if (b[f] !== undefined) {
      sets.push(f + ' = ?');
      binds.push(b[f]);
    }
  }
  if (sets.length === 0) return;
  binds.push(id);
  await db.prepare('UPDATE bom_items SET ' + sets.join(', ') + ' WHERE id = ?').bind(...binds).run();
}
`;

content = content.replace(/export async function deleteBom/, updateBomFunc + 'export async function deleteBom');
fs.writeFileSync('src/lib/db.ts', content);
