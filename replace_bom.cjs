const fs = require('fs');
let content = fs.readFileSync('src/components/ProjectEditor.astro', 'utf8');

const regex = /{p\.bom\.map\(\(b\) => \([\s\S]*?\)\)}/m;

const replacement = `{p.bom.map((b) => (
              <details class="data-row-edit" style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-sm); margin-bottom: 0.5rem;">
                <summary class="data-row" style="cursor: pointer; padding: 0.75rem; display: flex; align-items: center; border: none; background: transparent; list-style: none;">
                  <div class="data-row__main" style="flex: 1;">
                    <strong>{b.name} <span class="dim mono">x{b.qty}</span>{b.unit_price_inr > 0 && <span class="dim mono"> • ₹{b.unit_price_inr}</span>}</strong>
                    <span class="dim" style="font-size: 0.8rem; margin-top: 0.2rem;">{b.store || '—'}{b.affiliate_url ? ' • link set' : ' • no link'}{b.is_affiliate === 1 ? ' • affiliate' : ''}</span>
                  </div>
                  <div class="row-ctrl" style="display: flex; gap: 0.5rem; align-items: center;">
                    <span class="btn btn-ghost btn-xs" style="pointer-events: none;"><Icon name="edit" size={14} /> Edit</span>
                    <form method="post" action="/api/admin/bom/delete" class="inline-form" onsubmit="return confirm('Delete this part?');">
                      <input type="hidden" name="csrf" value={csrf} />
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="project_id" value={p.id} />
                      <button class="btn btn-ghost btn-xs btn-danger" type="submit" onclick="event.stopPropagation();"><Icon name="trash" size={14} /></button>
                    </form>
                  </div>
                </summary>
                <form method="post" action="/api/admin/bom/update" class="bom-add" style="padding: 1rem; border-top: 1px dashed var(--border); background: var(--surface-2); margin-top: 0;">
                  <input type="hidden" name="csrf" value={csrf} />
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="project_id" value={p.id} />
                  
                  <div class="grid-bom">
                    <input class="input" name="name" value={b.name} placeholder="Component" required />
                    <input class="input" name="qty" value={b.qty} placeholder="Qty" />
                    <input class="input" name="unit_price_inr" value={b.unit_price_inr || ''} type="number" min="0" placeholder="₹ price" />
                  </div>
                  <div class="grid-3">
                    <input class="input" name="store" value={b.store || ''} placeholder="Store (Amazon, Robu…)" />
                    <input class="input" name="price_checked" value={b.price_checked || ''} placeholder="Checked (Sep 2026)" />
                    <input class="input mono" name="affiliate_url" value={b.affiliate_url || ''} placeholder="Buy / affiliate URL" />
                  </div>
                  <div class="grid-2">
                    <input class="input" name="notes" value={b.notes || ''} placeholder="Notes / substitutes (optional)" />
                    <div class="bom-add__foot">
                      <label class="switch"><input type="checkbox" name="is_affiliate" checked={b.is_affiliate === 1} /> <span>Affiliate link</span></label>
                      <button class="btn btn-primary" type="submit"><Icon name="check" size={15} /> Save Changes</button>
                    </div>
                  </div>
                </form>
              </details>
            ))}`;

if(!regex.test(content)) {
  console.log('Regex failed');
} else {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/ProjectEditor.astro', content);
  console.log('Regex succeeded');
}
