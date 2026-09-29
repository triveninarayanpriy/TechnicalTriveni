const fs = require("fs");
let c = fs.readFileSync("src/components/ProjectEditor.astro", "utf8");

const oldForm = `<form method="post" action="/api/admin/step/add" class="stack-add">
          <input type="hidden" name="csrf" value={csrf} />
          <input type="hidden" name="project_id" value={p.id} />
          <input class="input" name="title" placeholder="Step title (optional)" />
          <textarea class="textarea" name="body" placeholder="Instruction (Markdown)…" required></textarea>
          <div class="grid-2">
            <input class="input" name="why" placeholder="Why / gotcha (optional)" />
            <input class="input mono" name="image_url" placeholder="Photo /media URL (optional)" />
          </div>
          <button class="btn btn-primary" type="submit"><Icon name="check" size={15} /> Add step</button>
        </form>`;

const newForm = `<form method="post" action="/api/admin/step/add" class="stack-add">
          <input type="hidden" name="csrf" value={csrf} />
          <input type="hidden" name="project_id" value={p.id} />
          
          <div class="grid-2">
            <input class="input" name="title" placeholder="Step title (optional)" />
            <input class="input" name="goal" placeholder="Goal (What are we achieving?)" />
          </div>

          <div class="grid-3">
            <input class="input" name="time_est" placeholder="Time estimate (e.g., 15 mins)" />
            <input class="input" name="video_ts" placeholder="Video timestamp (e.g., 04:15)" />
            <select class="select" name="file_id">
              <option value="">— Sketch/file to flash —</option>
              {p.files?.map(f => <option value={f.id}>{f.label || f.filename}</option>)}
            </select>
          </div>

          <div class="field">
            <label class="label">Parts needed (Ctrl+Click to select multiple)</label>
            <select class="select" name="parts_needed" multiple size="3">
              {p.bom?.map(b => <option value={b.name}>{b.name}</option>)}
            </select>
          </div>

          <textarea class="textarea" name="body" placeholder="Instruction (Markdown)…" required></textarea>
          
          <div class="grid-2">
            <input class="input" name="why" placeholder="Why / gotcha (optional)" />
            <input class="input mono" name="image_url" placeholder="Photo /media URL (optional)" />
          </div>

          <div class="grid-2">
            <textarea class="textarea" name="expected_res" placeholder="Expected result (Markdown)" rows="2"></textarea>
            <textarea class="textarea" name="if_fails" placeholder="If it fails (Markdown)" rows="2"></textarea>
          </div>

          <button class="btn btn-primary" type="submit"><Icon name="check" size={15} /> Add step</button>
        </form>`;

c = c.replace(oldForm, newForm);
fs.writeFileSync("src/components/ProjectEditor.astro", c);
