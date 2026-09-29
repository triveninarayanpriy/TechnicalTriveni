const fs = require("fs");
let c = fs.readFileSync("src/components/ProjectEditor.astro", "utf8");

const oldRow = `<div class="data-row__main">
                <strong>{s.title || s.body.slice(0, 60) || 'Step'}</strong>
                {s.why && <span class="dim">Why: {s.why}</span>}
              </div>`;

const newRow = `<div class="data-row__main" style="display: flex; flex-direction: column; gap: 0.25rem;">
                <strong>{s.title || s.body.slice(0, 60) || "Step"}</strong>
                <div class="dim" style="display:flex; gap:0.5rem; flex-wrap:wrap; font-size:0.85em;">
                  {s.goal && <span><Icon name="check" size={11} /> Goal: {s.goal}</span>}
                  {s.time_est && <span><Icon name="clock" size={11} /> {s.time_est}</span>}
                  {s.video_ts && <span><Icon name="play" size={11} /> {s.video_ts}</span>}
                  {s.parts_needed && <span><Icon name="cart" size={11} /> Parts: {s.parts_needed}</span>}
                </div>
                {s.why && <span class="dim">Why: {s.why}</span>}
                {(s.expected_res || s.if_fails) && (
                  <div class="dim" style="font-size:0.85em; border-left: 2px solid var(--border); padding-left: 0.5rem; margin-top: 0.25rem;">
                    {s.expected_res && <div style="color:var(--success)">Expected: {s.expected_res.slice(0,60)}</div>}
                    {s.if_fails && <div style="color:var(--danger)">If fails: {s.if_fails.slice(0,60)}</div>}
                  </div>
                )}
              </div>`;

c = c.replace(oldRow, newRow);
fs.writeFileSync("src/components/ProjectEditor.astro", c);
