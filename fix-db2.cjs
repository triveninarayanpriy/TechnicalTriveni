const fs = require("fs");
let c = fs.readFileSync("src/lib/db.ts", "utf8");

c = c.replace(/export async function addStep\(db: D1Database, s: Omit<ProjectStep, "id" \| "sort">\)\s*\{[\s\S]*?run\(\);\n\}/, 
`export async function addStep(db: D1Database, s: Omit<ProjectStep, "id" | "sort">) {
  const row = await db.prepare("SELECT COALESCE(MAX(sort),-1)+1 AS n FROM project_steps WHERE project_id = ?").bind(s.project_id).first();
  await db.prepare("INSERT INTO project_steps (project_id,title,body,why,image_url,sort,goal,time_est,parts_needed,file_id,expected_res,if_fails,video_ts) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
    .bind(s.project_id, s.title, s.body || "", s.why || "", s.image_url || "", (row && row.n) ? row.n : 0, s.goal || "", s.time_est || "", s.parts_needed || "", s.file_id || null, s.expected_res || "", s.if_fails || "", s.video_ts || "").run();
}`);

c = c.replace(/export async function updateStep\(db: D1Database, id: number, s: Partial<ProjectStep>\)\s*\{[\s\S]*?run\(\);\n\}/,
`export async function updateStep(db: D1Database, id: number, s: Partial<ProjectStep>) {
  const fields = ["title", "body", "why", "image_url", "goal", "time_est", "parts_needed", "file_id", "expected_res", "if_fails", "video_ts"];
  const sets = [];
  const binds = [];
  for (const f of fields) {
    if (s[f] !== undefined) {
      sets.push(f + " = ?");
      binds.push(s[f]);
    }
  }
  if (!sets.length) return;
  binds.push(id);
  await db.prepare("UPDATE project_steps SET " + sets.join(", ") + " WHERE id = ?").bind(...binds).run();
}`);

fs.writeFileSync("src/lib/db.ts", c);
