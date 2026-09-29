-- Phase 1: structured content for a production-grade Project View.
-- New project fields (decision zone, safety, licensing, code source).
ALTER TABLE projects ADD COLUMN outcome_line TEXT NOT NULL DEFAULT '';   -- one-line concrete outcome
ALTER TABLE projects ADD COLUMN est_cost     TEXT NOT NULL DEFAULT '';   -- approx build cost, e.g. "₹800"
ALTER TABLE projects ADD COLUMN cost_checked TEXT NOT NULL DEFAULT '';   -- date the cost was last checked
ALTER TABLE projects ADD COLUMN safety_note  TEXT NOT NULL DEFAULT '';   -- shown as a safety callout (Markdown)
ALTER TABLE projects ADD COLUMN license      TEXT NOT NULL DEFAULT 'MIT';
ALTER TABLE projects ADD COLUMN credits      TEXT NOT NULL DEFAULT '';   -- attributions (Markdown)
ALTER TABLE projects ADD COLUMN code_repo_url TEXT NOT NULL DEFAULT '';  -- canonical GitHub repo

-- BOM: price-checked date + explicit affiliate marking (legal disclosure).
ALTER TABLE bom_items ADD COLUMN price_checked TEXT NOT NULL DEFAULT '';
ALTER TABLE bom_items ADD COLUMN is_affiliate  INTEGER NOT NULL DEFAULT 0;

-- Numbered build steps, each with an optional "why" and photo.
CREATE TABLE IF NOT EXISTS project_steps (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT '',
  body       TEXT NOT NULL DEFAULT '',   -- instruction (Markdown)
  why        TEXT NOT NULL DEFAULT '',   -- the reason / gotcha
  image_url  TEXT NOT NULL DEFAULT '',
  sort       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_steps_project ON project_steps (project_id, sort);

-- Pin / wiring connection table (text — searchable & accessible).
CREATE TABLE IF NOT EXISTS project_pins (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  from_pin   TEXT NOT NULL DEFAULT '',
  to_pin     TEXT NOT NULL DEFAULT '',
  note       TEXT NOT NULL DEFAULT '',
  sort       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_pins_project ON project_pins (project_id, sort);

-- Troubleshooting: symptom → fix (ranks well in search).
CREATE TABLE IF NOT EXISTS project_troubleshooting (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  symptom    TEXT NOT NULL DEFAULT '',
  fix        TEXT NOT NULL DEFAULT '',
  sort       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_trouble_project ON project_troubleshooting (project_id, sort);
