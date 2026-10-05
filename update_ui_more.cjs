const fs = require('fs');
let content = fs.readFileSync('src/components/ProjectEditor.astro', 'utf8');

const regexSteps = /{p\.steps\.map\(\(s, i\) => \([\s\S]*?\)\)}/m;
const replacementSteps = `{p.steps.map((s, i) => (
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
            ))}`;
content = content.replace(regexSteps, replacementSteps);

const regexPins = /{p\.pins\.map\(\(pin\) => \([\s\S]*?\)\)}/m;
const replacementPins = `{p.pins.map((pin) => (
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
            ))}`;
content = content.replace(regexPins, replacementPins);


const regexTrouble = /{p\.troubleshooting\.map\(\(t\) => \([\s\S]*?\)\)}/m;
const replacementTrouble = `{p.troubleshooting.map((t) => (
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
            ))}`;
content = content.replace(regexTrouble, replacementTrouble);


fs.writeFileSync('src/components/ProjectEditor.astro', content);
