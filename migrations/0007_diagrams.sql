-- Add architecture diagram fields to projects
ALTER TABLE projects ADD COLUMN arch_svg TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN arch_image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN arch_alt TEXT NOT NULL DEFAULT '';

-- Add module grouping to wiring pins
ALTER TABLE project_pins ADD COLUMN module TEXT NOT NULL DEFAULT '';

-- New table for wiring diagrams
CREATE TABLE IF NOT EXISTS project_wiring_diagrams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  module TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_project_wiring_diagrams_project ON project_wiring_diagrams(project_id);
