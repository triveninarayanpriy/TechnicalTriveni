const fs = require('fs');
let content = fs.readFileSync('src/lib/db.ts', 'utf8');

const updateFuncs = `
export async function updateStep(db: D1Database, id: number, b: Partial<ProjectStep>) {
  const fields = ['title', 'body', 'why', 'image_url', 'goal', 'time_est', 'parts_needed', 'file_id', 'expected_res', 'if_fails', 'video_ts', 'sort'];
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
  await db.prepare('UPDATE project_steps SET ' + sets.join(', ') + ' WHERE id = ?').bind(...binds).run();
}

export async function updateTrouble(db: D1Database, id: number, b: any) {
  const fields = ['symptom', 'fix', 'sort'];
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
  await db.prepare('UPDATE project_troubleshooting SET ' + sets.join(', ') + ' WHERE id = ?').bind(...binds).run();
}

export async function updatePin(db: D1Database, id: number, b: Partial<ProjectPin>) {
  const fields = ['from_pin', 'to_pin', 'note', 'module', 'sort'];
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
  await db.prepare('UPDATE project_pins SET ' + sets.join(', ') + ' WHERE id = ?').bind(...binds).run();
}

export async function updateFile(db: D1Database, id: number, b: Partial<ProjectFile>) {
  const fields = ['label', 'kind', 'is_free', 'in_combo', 'sort'];
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
  await db.prepare('UPDATE project_files SET ' + sets.join(', ') + ' WHERE id = ?').bind(...binds).run();
}
`;

content = content.replace(/export async function deleteBom/, updateFuncs + '\nexport async function deleteBom');
fs.writeFileSync('src/lib/db.ts', content);
