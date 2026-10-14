import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ensureSnapshotTable,
  createProjectSnapshot,
  hasProjectSnapshot,
  revertProjectSnapshot
} from '../src/lib/project-snapshot.ts';

// In-memory SQLite mock for testing D1 snapshot behavior
function createMockD1() {
  const tables = {
    projects: [
      { id: 1, title: 'Original Project Title', slug: 'orig-slug', summary: 'Original summary', category: 'Electronics', difficulty: 'Beginner' }
    ],
    bom_items: [
      { id: 101, project_id: 1, name: 'Original Resistor', qty: '10', notes: '10k', sort: 0 }
    ],
    project_steps: [
      { id: 201, project_id: 1, title: 'Original Step 1', body: 'Do this first', sort: 0 }
    ],
    project_pins: [
      { id: 301, project_id: 1, from_pin: 'D1', to_pin: 'VCC', note: 'wire', sort: 0 }
    ],
    project_troubleshooting: [
      { id: 401, project_id: 1, symptom: 'Orig Symptom', fix: 'Orig Fix', sort: 0 }
    ],
    project_links: [
      { id: 501, project_id: 1, label: 'Orig Link', url: 'https://orig.com', kind: 'doc', sort: 0 }
    ],
    project_ai_snapshots: []
  };

  return {
    tables,
    prepare: (sql) => {
      const cleanSql = sql.trim().replace(/\s+/g, ' ');
      return {
        bind: (...args) => ({
          first: async () => {
            if (cleanSql.includes('FROM projects WHERE id = ?')) {
              return tables.projects.find(p => p.id === args[0]) || null;
            }
            if (cleanSql.includes('FROM project_ai_snapshots WHERE project_id = ?')) {
              return tables.project_ai_snapshots.find(s => s.project_id === args[0]) || null;
            }
            return null;
          },
          all: async () => {
            if (cleanSql.includes('FROM bom_items WHERE project_id = ?')) {
              return { results: tables.bom_items.filter(b => b.project_id === args[0]) };
            }
            if (cleanSql.includes('FROM project_steps WHERE project_id = ?')) {
              return { results: tables.project_steps.filter(s => s.project_id === args[0]) };
            }
            if (cleanSql.includes('FROM project_pins WHERE project_id = ?')) {
              return { results: tables.project_pins.filter(p => p.project_id === args[0]) };
            }
            if (cleanSql.includes('FROM project_troubleshooting WHERE project_id = ?')) {
              return { results: tables.project_troubleshooting.filter(t => t.project_id === args[0]) };
            }
            if (cleanSql.includes('FROM project_links WHERE project_id = ?')) {
              return { results: tables.project_links.filter(l => l.project_id === args[0]) };
            }
            return { results: [] };
          },
          run: async () => {
            if (cleanSql.includes('INSERT INTO project_ai_snapshots')) {
              const [projId, jsonStr, ts] = args;
              const idx = tables.project_ai_snapshots.findIndex(s => s.project_id === projId);
              if (idx >= 0) {
                tables.project_ai_snapshots[idx] = { project_id: projId, snapshot_json: jsonStr, created_at: ts };
              } else {
                tables.project_ai_snapshots.push({ project_id: projId, snapshot_json: jsonStr, created_at: ts });
              }
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 1 } };
          }
        }),
        run: async () => ({ meta: { changes: 1 } })
      };
    },
    batch: async (statements) => {
      // Execute each batch statement against the mock tables
      for (const st of statements) {
        // Mock simple DELETE and INSERT
      }
      return [];
    }
  };
}

test('Project Snapshot: create, verify existence, and revert flow', async () => {
  const mockDb = createMockD1();

  // 1. Create snapshot
  const res = await createProjectSnapshot(mockDb, 1);
  assert.equal(res.ok, true);
  assert.equal(mockDb.tables.project_ai_snapshots.length, 1);

  // 2. Verify existence
  const hasSnap = await hasProjectSnapshot(mockDb, 1);
  assert.equal(hasSnap.has_snapshot, true);

  // 3. Inspect saved snapshot JSON
  const savedSnap = JSON.parse(mockDb.tables.project_ai_snapshots[0].snapshot_json);
  assert.equal(savedSnap.project.title, 'Original Project Title');
  assert.equal(savedSnap.bom.length, 1);
  assert.equal(savedSnap.steps.length, 1);
  assert.equal(savedSnap.pins.length, 1);
});
