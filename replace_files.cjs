const fs = require('fs');
let content = fs.readFileSync('src/components/ProjectEditor.astro', 'utf8');

const oldSection = /<!-- ===== Resource files ===== -->[\s\S]*?<\/form>\s*<\/section>/;

const newSection = `      <!-- ===== Resource files ===== -->
      <section class="child-panel panel" id="resource-files">
        <h3><Icon name="download" size={18} /> Resource Documents & Files</h3>
        <p class="dim child-lead">Manage all downloadable files for this project (Code, PDFs, 3D files). You can set files as completely free for anyone to download, or restrict them to only buyers of the Combo Pack.</p>
        <div class="rows">
          {p.files.map((f) => (
            <div class="data-row" style="background: var(--bg); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 0.75rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
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
              <form method="post" action="/api/admin/file/delete" class="inline-form" onsubmit="return confirm('Are you sure you want to permanently delete this file?');">
                <input type="hidden" name="csrf" value={csrf} />
                <input type="hidden" name="id" value={f.id} />
                <input type="hidden" name="project_id" value={p.id} />
                <button class="btn btn-ghost btn-danger" type="submit" style="padding: 0.5rem;" title="Delete file"><Icon name="trash" size={18} /></button>
              </form>
            </div>
          ))}
          {p.files.length === 0 && <div class="dim" style="padding: 1.5rem; text-align: center; border: 1px dashed var(--border); border-radius: var(--r-md);">No files uploaded yet. Add your first file below!</div>}
        </div>
        
        <form method="post" action="/api/admin/file/add" enctype="multipart/form-data" class="file-add panel" style="background: var(--surface-2); padding: 1.5rem; border: 1px solid var(--border); margin-top: 1rem;">
          <h4 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--text); display: flex; align-items: center; gap: 0.5rem;"><Icon name="plus-circle" size={18} /> Upload a new file</h4>
          <input type="hidden" name="csrf" value={csrf} />
          <input type="hidden" name="project_id" value={p.id} />
          
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div class="grid-2">
              <div>
                <label class="label">1. Choose File</label>
                <input class="input" type="file" name="file" id="file-upload-input" required />
              </div>
              <div>
                <label class="label">2. File Type</label>
                <select class="select" name="kind">
                  {FILE_KINDS.map((k) => <option value={k.key}>{k.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label class="label">3. Display Label (Auto-fills from file name)</label>
              <input class="input" name="label" id="file-label-input" placeholder="e.g. Schematic PDF, Arduino Code..." required />
            </div>

            <div class="file-add__access" style="background: var(--bg); padding: 1.25rem; border: 1px solid var(--border); border-radius: var(--r-md);">
              <label class="label" style="font-size: 1rem; color: var(--text);">4. Who can download this?</label>
              <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.75rem;">
                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; background: var(--surface); padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px;">
                  <input type="radio" name="access_level" value="free" checked style="width: 18px; height: 18px;" />
                  <div>
                    <strong style="display: block; font-size: 0.95rem;">Free (Public Download)</strong>
                    <span class="dim" style="font-size: 0.8rem;">Anyone can download this file without paying.</span>
                  </div>
                </label>
                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; background: var(--surface); padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px;">
                  <input type="radio" name="access_level" value="combo" style="width: 18px; height: 18px;" />
                  <div>
                    <strong style="display: block; font-size: 0.95rem;">Paid Combo Pack</strong>
                    <span class="dim" style="font-size: 0.8rem;">Only customers who purchased the combo pack can download this.</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
              <button class="btn btn-primary" type="submit" style="font-size: 1.05rem; padding: 0.75rem 1.5rem;"><Icon name="upload-cloud" size={18} /> Upload & Save File</button>
            </div>
          </div>
        </form>
      </section>`;

if (!oldSection.test(content)) {
  console.log("Could not find section");
} else {
  content = content.replace(oldSection, newSection);
  fs.writeFileSync('src/components/ProjectEditor.astro', content);
  console.log("Replaced successfully!");
}
