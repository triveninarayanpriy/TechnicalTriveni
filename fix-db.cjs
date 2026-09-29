const fs = require("fs");
let c = fs.readFileSync("src/lib/db.ts", "utf8");

// update interface
c = c.replace(/export interface ProjectStep \{\n\s*id: number; project_id: number; title: string; body: string; why: string; image_url: string; sort: number;\n\s*\}/, 
`export interface ProjectStep {
  id: number; project_id: number; title: string; body: string; why: string; image_url: string; sort: number;
  goal: string; time_est: string; parts_needed: string; file_id: number | null; expected_res: string; if_fails: string; video_ts: string;
}`);

// update addStep
c = c.replace(/export async function addStep\(db: D1Database, s: Omit<ProjectStep, 'id' \| 'sort'>\) \{\n[\s\S]*?\}\n/, 
`export async function addStep(db: D1Database, s: Omit<ProjectStep, "id" | "sort">) {
  const row = await db.prepare("SELECT COALESCE(MAX(sort),-1)+1 AS n FROM project_steps WHERE project_id = ?")
    .bind(s.project_id).first<{ n: number }>();
  await db.prepare("INSERT INTO project_steps (project_id,title,body,why,image_url,sort,goal,time_est,parts_needed,file_id,expected_res,if_fails,video_ts) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)")
    .bind(s.project_id, s.title, s.body ?? "", s.why ?? "", s.image_url ?? "", row?.n ?? 0, s.goal ?? "", s.time_est ?? "", s.parts_needed ?? "", s.file_id ?? null, s.expected_res ?? "", s.if_fails ?? "", s.video_ts ?? "").run();
}
`);

// update updateStep
c = c.replace(/export async function updateStep\(db: D1Database, id: number, s: Partial<ProjectStep>\) \{\n[\s\S]*?\}\n/,
`export async function updateStep(db: D1Database, id: number, s: Partial<ProjectStep>) {
  const fields = ["title", "body", "why", "image_url", "goal", "time_est", "parts_needed", "file_id", "expected_res", "if_fails", "video_ts"];
  const sets = [];
  const binds = [];
  for (const f of fields) {
    if (s[f as keyof ProjectStep] !== undefined) {
      sets.push(f + " = ?");
      binds.push(s[f as keyof ProjectStep]);
    }
  }
  if (!sets.length) return;
  binds.push(id);
  await db.prepare("UPDATE project_steps SET " + sets.join(", ") + " WHERE id = ?").bind(...binds).run();
}
`);

fs.writeFileSync("src/lib/db.ts", c);
