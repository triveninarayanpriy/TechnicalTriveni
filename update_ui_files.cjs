const fs = require('fs');
let content = fs.readFileSync('src/components/ProjectEditor.astro', 'utf8');

const regexFiles = /{p\.files\.map\(\(f\) => \([\s\S]*?\)\)}/m;
const replacementFiles = `{p.files.map((f) => (
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
          ))}`;
content = content.replace(regexFiles, replacementFiles);
fs.writeFileSync('src/components/ProjectEditor.astro', content);
