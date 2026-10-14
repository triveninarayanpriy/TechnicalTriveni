import type { D1Database } from '@cloudflare/workers-types';

export interface ProjectSnapshotData {
  project_id: number;
  created_at: number;
  project: Record<string, any>;
  bom: any[];
  steps: any[];
  pins: any[];
  troubleshooting: any[];
  links: any[];
}

/**
 * Ensures the project_ai_snapshots table exists in SQLite / Cloudflare D1.
 */
export async function ensureSnapshotTable(db: D1Database): Promise<void> {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS project_ai_snapshots (
      project_id INTEGER PRIMARY KEY,
      snapshot_json TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `).run();
}

/**
 * Creates and stores a snapshot of the project and its child tables before applying AI changes.
 */
export async function createProjectSnapshot(
  db: D1Database,
  projectId: number
): Promise<{ ok: boolean; timestamp?: number }> {
  if (!projectId || projectId <= 0) {
    return { ok: false };
  }

  await ensureSnapshotTable(db);

  const [projRow, bomRes, stepsRes, pinsRes, troubleRes, linksRes] = await Promise.all([
    db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first<Record<string, any>>(),
    db.prepare('SELECT * FROM bom_items WHERE project_id = ? ORDER BY sort, id').bind(projectId).all(),
    db.prepare('SELECT * FROM project_steps WHERE project_id = ? ORDER BY sort, id').bind(projectId).all(),
    db.prepare('SELECT * FROM project_pins WHERE project_id = ? ORDER BY sort, id').bind(projectId).all(),
    db.prepare('SELECT * FROM project_troubleshooting WHERE project_id = ? ORDER BY sort, id').bind(projectId).all(),
    db.prepare('SELECT * FROM project_links WHERE project_id = ? ORDER BY sort, id').bind(projectId).all()
  ]);

  if (!projRow) {
    return { ok: false };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const snapshot: ProjectSnapshotData = {
    project_id: projectId,
    created_at: timestamp,
    project: projRow,
    bom: bomRes.results ?? [],
    steps: stepsRes.results ?? [],
    pins: pinsRes.results ?? [],
    troubleshooting: troubleRes.results ?? [],
    links: linksRes.results ?? []
  };

  const jsonStr = JSON.stringify(snapshot);

  await db.prepare(`
    INSERT INTO project_ai_snapshots (project_id, snapshot_json, created_at)
    VALUES (?, ?, ?)
    ON CONFLICT(project_id) DO UPDATE SET
      snapshot_json = excluded.snapshot_json,
      created_at = excluded.created_at
  `).bind(projectId, jsonStr, timestamp).run();

  return { ok: true, timestamp };
}

/**
 * Checks whether an active snapshot exists for a project.
 */
export async function hasProjectSnapshot(
  db: D1Database,
  projectId: number
): Promise<{ has_snapshot: boolean; created_at?: number }> {
  if (!projectId || projectId <= 0) return { has_snapshot: false };
  try {
    await ensureSnapshotTable(db);
    const row = await db.prepare('SELECT created_at FROM project_ai_snapshots WHERE project_id = ?')
      .bind(projectId)
      .first<{ created_at: number }>();
    if (row && row.created_at) {
      return { has_snapshot: true, created_at: row.created_at };
    }
  } catch {}
  return { has_snapshot: false };
}

/**
 * Restores a project and all its child tables from the pre-AI snapshot.
 */
export async function revertProjectSnapshot(
  db: D1Database,
  projectId: number
): Promise<{ ok: boolean; message: string }> {
  if (!projectId || projectId <= 0) {
    return { ok: false, message: 'Invalid project ID.' };
  }

  await ensureSnapshotTable(db);
  const row = await db.prepare('SELECT snapshot_json FROM project_ai_snapshots WHERE project_id = ?')
    .bind(projectId)
    .first<{ snapshot_json: string }>();

  if (!row || !row.snapshot_json) {
    return { ok: false, message: 'No AI snapshot found to revert.' };
  }

  let snapshot: ProjectSnapshotData;
  try {
    snapshot = JSON.parse(row.snapshot_json);
  } catch {
    return { ok: false, message: 'Failed to parse project snapshot.' };
  }

  const p = snapshot.project;

  // 1. Restore projects table columns
  const allowedProjectCols = [
    'title', 'slug', 'summary', 'description', 'category', 'difficulty',
    'cover_image', 'video_url', 'model_url', 'tags', 'build_time',
    'outcome_line', 'cost_override', 'cost_checked', 'safety_note',
    'license', 'credits', 'code_repo_url', 'price_inr', 'combo_enabled',
    'combo_title', 'combo_description', 'featured', 'published', 'sort',
    'meta_title', 'meta_description', 'og_image', 'prereqs_json',
    'not_included_json', 'outcomes_json', 'faq_json', 'changelog', 'version', 'last_tested_at'
  ];

  const updateSets: string[] = [];
  const updateBinds: any[] = [];

  for (const col of allowedProjectCols) {
    if (p[col] !== undefined) {
      updateSets.push(`${col} = ?`);
      updateBinds.push(p[col]);
    }
  }

  updateSets.push('updated_at = ?');
  updateBinds.push(Math.floor(Date.now() / 1000));
  updateBinds.push(projectId);

  const statements: any[] = [
    db.prepare(`UPDATE projects SET ${updateSets.join(', ')} WHERE id = ?`).bind(...updateBinds),
    // Clear current child rows
    db.prepare('DELETE FROM bom_items WHERE project_id = ?').bind(projectId),
    db.prepare('DELETE FROM project_steps WHERE project_id = ?').bind(projectId),
    db.prepare('DELETE FROM project_pins WHERE project_id = ?').bind(projectId),
    db.prepare('DELETE FROM project_troubleshooting WHERE project_id = ?').bind(projectId),
    db.prepare('DELETE FROM project_links WHERE project_id = ?').bind(projectId)
  ];

  // Re-insert BOM
  for (const b of snapshot.bom || []) {
    statements.push(
      db.prepare(`
        INSERT INTO bom_items (project_id, name, qty, notes, store, affiliate_url, unit_price_inr, price_checked, is_affiliate, component_id, is_required, group_name, stage_tag, sort)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        projectId, b.name, b.qty || '1', b.notes || '', b.store || '', b.affiliate_url || '',
        b.unit_price_inr || 0, b.price_checked || '', b.is_affiliate || 0, b.component_id || 0,
        b.is_required ?? 1, b.group_name || '', b.stage_tag || '', b.sort || 0
      )
    );
  }

  // Re-insert steps
  for (const s of snapshot.steps || []) {
    statements.push(
      db.prepare(`
        INSERT INTO project_steps (project_id, title, body, why, image_url, sort, goal, time_est, parts_needed, file_id, expected_res, if_fails, video_ts)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        projectId, s.title, s.body || '', s.why || '', s.image_url || '', s.sort || 0,
        s.goal || '', s.time_est || '', s.parts_needed || '', s.file_id || null,
        s.expected_res || '', s.if_fails || '', s.video_ts || ''
      )
    );
  }

  // Re-insert pins
  for (const pin of snapshot.pins || []) {
    statements.push(
      db.prepare(`
        INSERT INTO project_pins (project_id, from_pin, to_pin, note, sort)
        VALUES (?, ?, ?, ?, ?)
      `).bind(projectId, pin.from_pin, pin.to_pin, pin.note || '', pin.sort || 0)
    );
  }

  // Re-insert troubleshooting
  for (const tb of snapshot.troubleshooting || []) {
    statements.push(
      db.prepare(`
        INSERT INTO project_troubleshooting (project_id, symptom, cause, fix, sort)
        VALUES (?, ?, ?, ?, ?)
      `).bind(projectId, tb.symptom, tb.cause || '', tb.fix, tb.sort || 0)
    );
  }

  // Re-insert links
  for (const l of snapshot.links || []) {
    statements.push(
      db.prepare(`
        INSERT INTO project_links (project_id, label, url, kind, sort)
        VALUES (?, ?, ?, ?, ?)
      `).bind(projectId, l.label, l.url, l.kind || 'other', l.sort || 0)
    );
  }

  // Remove the snapshot row now that it has been restored
  statements.push(
    db.prepare('DELETE FROM project_ai_snapshots WHERE project_id = ?').bind(projectId)
  );

  await db.batch(statements);

  return { ok: true, message: 'Successfully reverted project to pre-AI state.' };
}
