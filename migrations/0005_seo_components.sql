-- Phase 3: per-project SEO overrides + a reusable component library.

-- SEO overrides (fall back to title / summary / cover at render time).
ALTER TABLE projects ADD COLUMN meta_title       TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN meta_description TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN og_image         TEXT NOT NULL DEFAULT '';

-- Reusable components: maintain price/link once, reference from many projects.
CREATE TABLE IF NOT EXISTS components (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL,
  store            TEXT NOT NULL DEFAULT '',
  buy_url          TEXT NOT NULL DEFAULT '',
  is_affiliate     INTEGER NOT NULL DEFAULT 0,
  unit_price_inr   INTEGER NOT NULL DEFAULT 0,
  price_checked    TEXT NOT NULL DEFAULT '',
  notes            TEXT NOT NULL DEFAULT '',
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_components_name ON components (name);

-- A BOM row may reference a library component (0 = standalone/custom row).
ALTER TABLE bom_items ADD COLUMN component_id INTEGER NOT NULL DEFAULT 0;
