const fs = require('fs');
let content = fs.readFileSync('src/components/ProjectEditor.astro', 'utf8');

function replaceBlock(content, startText, endText, newBlock) {
  const startIndex = content.indexOf(startText);
  if (startIndex === -1) {
    console.log('Could not find startText:\n', startText.substring(0, 50));
    return content;
  }
  const endIndex = content.indexOf(endText, startIndex);
  if (endIndex === -1) {
    console.log('Could not find endText:\n', endText.substring(0, 50));
    return content;
  }
  return content.substring(0, startIndex) + newBlock + content.substring(endIndex + endText.length);
}

const bomStart = "{p.bom.map((b) => (";
const bomEnd = "{p.bom.length === 0 && <p class=\"dim\">No components yet.</p>}";
const bomNew = `{p.bom.map((b) => (
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
            ))}
            ` + bomEnd;
content = replaceBlock(content, bomStart, bomEnd, bomNew);

const stepsStart = "{p.steps.map((s, i) => (";
const stepsEnd = "{p.steps.length === 0 && <p class=\"dim\">No steps yet.</p>}";
const stepsNew = `{p.steps.map((s, i) => (
              <details class="data-row-edit" style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-sm); margin-bottom: 0.5rem;">
                <summary class="data-row" style="cursor: pointer; padding: 0.75rem; display: flex; align-items: center; border: none; background: transparent; list-style: none;">
                  <span class="data-row__icon step-badge">{i + 1}</span>
                  <div class="data-row__main" style="flex: 1;">
                    <strong>{s.title || s.body.slice(0, 60) || 'Step'}</strong>
                    {s.why && <span class="dim">Why: {s.why}</span>}
                  </div>
                  <div class="row-ctrl" style="display: flex; gap: 0.5rem; align-items: center;">
                    <span class="btn btn-ghost btn-xs" style="pointer-events: none;"><Icon name="edit" size={14} /> Edit</span>
                    {['up', 'down'].map((dir) => (
                      <form method="post" action="/api/admin/step/move" class="inline-form">
                        <input type="hidden" name="csrf" value={csrf} />
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="project_id" value={p.id} />
                        <input type="hidden" name="dir" value={dir} />
                        <button class="btn btn-ghost btn-xs" type="submit" onclick="event.stopPropagation();" disabled={dir === 'up' ? i === 0 : i === p.steps.length - 1}><Icon name={dir === 'up' ? 'chevron-up' : 'chevron-down'} size={13} /></button>
                      </form>
                    ))}
                    <form method="post" action="/api/admin/step/delete" class="inline-form" onsubmit="return confirm('Delete step?');">
                      <input type="hidden" name="csrf" value={csrf} />
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="project_id" value={p.id} />
                      <button class="btn btn-ghost btn-xs btn-danger" type="submit" onclick="event.stopPropagation();"><Icon name="trash" size={14} /></button>
                    </form>
                  </div>
                </summary>
                <form method="post" action="/api/admin/step/update" class="stack-add" style="padding: 1rem; border-top: 1px dashed var(--border); background: var(--surface-2); margin-top: 0;">
                  <input type="hidden" name="csrf" value={csrf} />
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="project_id" value={p.id} />
                  <input class="input" name="title" value={s.title || ''} placeholder="Title (optional)" />
                  <textarea class="textarea" name="body" placeholder="Step instructions (Markdown)…" required>{s.body}</textarea>
                  <input class="input" name="why" value={s.why || ''} placeholder="Why are we doing this? (optional)" />
                  <button class="btn btn-primary" type="submit"><Icon name="check" size={15} /> Save Step</button>
                </form>
              </details>
            ))}
            ` + stepsEnd;
content = replaceBlock(content, stepsStart, stepsEnd, stepsNew);

const pinsStart = "{p.pins.map((pin) => (";
const pinsEnd = "{p.pins.length === 0 && <p class=\"dim\">No connections yet.</p>}";
const pinsNew = `{p.pins.map((pin) => (
              <details class="data-row-edit" style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-sm); margin-bottom: 0.5rem;">
                <summary class="data-row" style="cursor: pointer; padding: 0.75rem; display: flex; align-items: center; border: none; background: transparent; list-style: none;">
                  <div class="data-row__main" style="flex: 1;">
                    <strong class="mono">{pin.from_pin} → {pin.to_pin}</strong>
                    {pin.module && <span class="mini-tag" style="margin-left: 0.5rem;">{pin.module}</span>}
                    {pin.note && <span class="dim" style="display: block; margin-top: 0.2rem;">{pin.note}</span>}
                  </div>
                  <div class="row-ctrl" style="display: flex; gap: 0.5rem; align-items: center;">
                    <span class="btn btn-ghost btn-xs" style="pointer-events: none;"><Icon name="edit" size={14} /> Edit</span>
                    <form method="post" action="/api/admin/pin/delete" class="inline-form" onsubmit="return confirm('Delete connection?');">
                      <input type="hidden" name="csrf" value={csrf} />
                      <input type="hidden" name="id" value={pin.id} />
                      <input type="hidden" name="project_id" value={p.id} />
                      <button class="btn btn-ghost btn-xs btn-danger" type="submit" onclick="event.stopPropagation();"><Icon name="trash" size={14} /></button>
                    </form>
                  </div>
                </summary>
                <form method="post" action="/api/admin/pin/update" class="add-row" style="padding: 1rem; border-top: 1px dashed var(--border); background: var(--surface-2); margin-top: 0;">
                  <input type="hidden" name="csrf" value={csrf} />
                  <input type="hidden" name="id" value={pin.id} />
                  <input type="hidden" name="project_id" value={p.id} />
                  <input class="input mono" name="from_pin" value={pin.from_pin} placeholder="From (ESP32 D5)" required />
                  <input class="input mono" name="to_pin" value={pin.to_pin} placeholder="To (Relay IN1)" required />
                  <input class="input" name="module" value={pin.module || ''} placeholder="Module / Board (optional)" />
                  <input class="input" name="note" value={pin.note || ''} placeholder="Note (optional)" />
                  <button class="btn btn-primary" type="submit"><Icon name="check" size={15} /> Save</button>
                </form>
              </details>
            ))}
            ` + pinsEnd;
content = replaceBlock(content, pinsStart, pinsEnd, pinsNew);

const troubleStart = "{p.troubleshooting.map((t) => (";
const troubleEnd = "{p.troubleshooting.length === 0 && <p class=\"dim\">No tips yet.</p>}";
const troubleNew = `{p.troubleshooting.map((t) => (
              <details class="data-row-edit" style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-sm); margin-bottom: 0.5rem;">
                <summary class="data-row" style="cursor: pointer; padding: 0.75rem; display: flex; align-items: center; border: none; background: transparent; list-style: none;">
                  <div class="data-row__main" style="flex: 1;">
                    <strong>{t.symptom}</strong>
                    <span class="dim" style="display: block; margin-top: 0.2rem;">{t.fix}</span>
                  </div>
                  <div class="row-ctrl" style="display: flex; gap: 0.5rem; align-items: center;">
                    <span class="btn btn-ghost btn-xs" style="pointer-events: none;"><Icon name="edit" size={14} /> Edit</span>
                    <form method="post" action="/api/admin/trouble/delete" class="inline-form" onsubmit="return confirm('Delete tip?');">
                      <input type="hidden" name="csrf" value={csrf} />
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="project_id" value={p.id} />
                      <button class="btn btn-ghost btn-xs btn-danger" type="submit" onclick="event.stopPropagation();"><Icon name="trash" size={14} /></button>
                    </form>
                  </div>
                </summary>
                <form method="post" action="/api/admin/trouble/update" class="stack-add" style="padding: 1rem; border-top: 1px dashed var(--border); background: var(--surface-2); margin-top: 0;">
                  <input type="hidden" name="csrf" value={csrf} />
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="project_id" value={p.id} />
                  <input class="input" name="symptom" value={t.symptom} placeholder="Symptom e.g. LED not lighting up" required />
                  <textarea class="textarea" name="fix" placeholder="The fix (Markdown)…" required>{t.fix}</textarea>
                  <button class="btn btn-primary" type="submit"><Icon name="check" size={15} /> Save Tip</button>
                </form>
              </details>
            ))}
            ` + troubleEnd;
content = replaceBlock(content, troubleStart, troubleEnd, troubleNew);

const filesStart = "{p.files.map((f) => (";
const filesEnd = "{p.files.length === 0 && <div class=\"dim\"";
const filesNew = `{p.files.map((f) => (
            <details class="data-row-edit" style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-sm); margin-bottom: 0.5rem;">
              <summary class="data-row" style="cursor: pointer; padding: 0.75rem; display: flex; align-items: center; gap: 1rem; border: none; background: transparent; list-style: none;">
                <span class="data-row__icon" style="color: var(--brand-red);"><Icon name={FILE_KINDS.find((k) => k.key === f.kind)?.icon || 'file'} size={24} /></span>
                <div class="data-row__main" style="flex: 1;">
                  <strong style="font-size: 1rem;">{f.label}</strong>
                  <div style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 0.25rem;">
                    {f.filename || '-'}{f.size_bytes ? \` • \${formatBytes(f.size_bytes)}\` : ''}{!f.r2_key ? ' • error missing' : ''}
                  </div>
                </div>
                <div class="data-row__tags" style="display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-end;">
                  {f.is_free === 1 && <span class="mini-tag" style="background: rgba(21, 128, 61, 0.1); color: #15803d; border: 1px solid #15803d; font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 4px;">Free Public Download</span>}
                  {f.in_combo === 1 && <span class="mini-tag" style="background: rgba(245, 158, 11, 0.1); color: #d97706; border: 1px solid #d97706; font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 4px;">Paid Combo Pack</span>}
                </div>
                <div class="row-ctrl" style="display: flex; gap: 0.5rem; align-items: center; margin-left: 0.5rem;">
                  <span class="btn btn-ghost btn-xs" style="pointer-events: none;"><Icon name="edit" size={14} /> Edit</span>
                  <form method="post" action="/api/admin/file/delete" class="inline-form" onsubmit="return confirm('Are you sure you want to permanently delete this file?');">
                    <input type="hidden" name="csrf" value={csrf} />
                    <input type="hidden" name="id" value={f.id} />
                    <input type="hidden" name="project_id" value={p.id} />
                    <button class="btn btn-ghost btn-danger" type="submit" style="padding: 0.5rem;" title="Delete file" onclick="event.stopPropagation();"><Icon name="trash" size={18} /></button>
                  </form>
                </div>
              </summary>
              <form method="post" action="/api/admin/file/update" class="file-add panel" style="background: var(--surface-2); padding: 1.5rem; border-top: 1px dashed var(--border); margin-top: 0;">
                <input type="hidden" name="csrf" value={csrf} />
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="project_id" value={p.id} />
                
                <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                  <div class="grid-2">
                    <div>
                      <label class="label">Display Label</label>
                      <input class="input" name="label" value={f.label} required />
                    </div>
                    <div>
                      <label class="label">File Type</label>
                      <select class="select" name="kind">
                        {FILE_KINDS.map((k) => <option value={k.key} selected={k.key === f.kind}>{k.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div class="file-add__access" style="background: var(--bg); padding: 1.25rem; border: 1px solid var(--border); border-radius: var(--r-md);">
                    <label class="label" style="font-size: 1rem; color: var(--text);">Who can download this?</label>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.75rem;">
                      <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; background: var(--surface); padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px;">
                        <input type="radio" name="access_level" value="free" checked={f.is_free === 1} style="width: 18px; height: 18px;" />
                        <div>
                          <strong style="display: block; font-size: 0.95rem;">Free (Public Download)</strong>
                          <span class="dim" style="font-size: 0.8rem;">Anyone can download this file without paying.</span>
                        </div>
                      </label>
                      <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; background: var(--surface); padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px;">
                        <input type="radio" name="access_level" value="combo" checked={f.is_free !== 1} style="width: 18px; height: 18px;" />
                        <div>
                          <strong style="display: block; font-size: 0.95rem;">Paid Combo Pack</strong>
                          <span class="dim" style="font-size: 0.8rem;">Only customers who purchased the combo pack can download this.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
                    <button class="btn btn-primary" type="submit"><Icon name="check" size={15} /> Save Changes</button>
                  </div>
                </div>
              </form>
            </details>
          ))}
          ` + filesEnd;
content = replaceBlock(content, filesStart, filesEnd, filesNew);

fs.writeFileSync('src/components/ProjectEditor.astro', content);
