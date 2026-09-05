-- ============================================================================
--  Technical Triveni — initial schema (Cloudflare D1 / SQLite)
-- ============================================================================

-- Projects: the core content unit.
CREATE TABLE IF NOT EXISTS projects (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  summary       TEXT NOT NULL DEFAULT '',       -- one-line hook (cards, meta)
  description   TEXT NOT NULL DEFAULT '',       -- full write-up (Markdown)
  category      TEXT NOT NULL DEFAULT 'Electronics',
  difficulty    TEXT NOT NULL DEFAULT 'Beginner', -- Beginner|Intermediate|Advanced
  cover_image   TEXT NOT NULL DEFAULT '',       -- URL or /media/<key>
  video_url     TEXT NOT NULL DEFAULT '',       -- YouTube / reel link
  tags          TEXT NOT NULL DEFAULT '',       -- comma-separated
  build_time    TEXT NOT NULL DEFAULT '',       -- e.g. "2–3 hours"

  -- Paid combo (digital bundle: code + schematic + 3D + docs)
  price_inr        INTEGER NOT NULL DEFAULT 0,  -- whole rupees; 0 = free project
  combo_enabled    INTEGER NOT NULL DEFAULT 0,  -- 1 = combo purchasable
  combo_title      TEXT NOT NULL DEFAULT 'Complete Project Combo',
  combo_description TEXT NOT NULL DEFAULT '',    -- what the buyer receives

  featured      INTEGER NOT NULL DEFAULT 0,
  published     INTEGER NOT NULL DEFAULT 0,
  sort          INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects (published, featured, sort, created_at);
CREATE INDEX IF NOT EXISTS idx_projects_category  ON projects (category);

-- Gallery images for a project (beyond the cover).
CREATE TABLE IF NOT EXISTS project_images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  url        TEXT NOT NULL,                     -- /media/<key> or external
  caption    TEXT NOT NULL DEFAULT '',
  sort       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_images_project ON project_images (project_id, sort);

-- Downloadable resources. `in_combo`+paid → delivered after purchase;
-- `is_free` → downloadable by anyone (e.g. a wiring diagram teaser).
CREATE TABLE IF NOT EXISTS project_files (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  label      TEXT NOT NULL,                     -- "Arduino source (.ino)"
  kind       TEXT NOT NULL DEFAULT 'other',     -- code|schematic|pcb|model3d|doc|other
  r2_key     TEXT NOT NULL DEFAULT '',          -- object key in the FILES bucket
  filename   TEXT NOT NULL DEFAULT '',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  is_free    INTEGER NOT NULL DEFAULT 0,        -- 1 = free download
  in_combo   INTEGER NOT NULL DEFAULT 1,        -- 1 = included in paid combo
  sort       INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_files_project ON project_files (project_id, sort);

-- Bill of materials — each component with an affiliate purchase link.
CREATE TABLE IF NOT EXISTS bom_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id    INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  qty           TEXT NOT NULL DEFAULT '1',
  notes         TEXT NOT NULL DEFAULT '',
  store         TEXT NOT NULL DEFAULT '',        -- Amazon / Robu / AliExpress…
  affiliate_url TEXT NOT NULL DEFAULT '',
  unit_price_inr INTEGER NOT NULL DEFAULT 0,      -- optional, 0 = hide
  sort          INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_bom_project ON bom_items (project_id, sort);

-- Extra resource links (video, GitHub, live demo, datasheets…).
CREATE TABLE IF NOT EXISTS project_links (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  url        TEXT NOT NULL,
  kind       TEXT NOT NULL DEFAULT 'other',      -- video|github|doc|demo|other
  sort       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_links_project ON project_links (project_id, sort);

-- Orders for paid combos.
CREATE TABLE IF NOT EXISTS orders (
  id                  TEXT PRIMARY KEY,           -- our uuid
  project_id          INTEGER NOT NULL REFERENCES projects (id),
  project_title       TEXT NOT NULL DEFAULT '',   -- snapshot for the receipt
  email               TEXT NOT NULL,
  amount_inr          INTEGER NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'INR',
  status              TEXT NOT NULL DEFAULT 'created', -- created|paid|failed
  razorpay_order_id   TEXT NOT NULL DEFAULT '',
  razorpay_payment_id TEXT NOT NULL DEFAULT '',
  razorpay_signature  TEXT NOT NULL DEFAULT '',
  download_token      TEXT NOT NULL DEFAULT '',   -- issued on successful payment
  created_at          INTEGER NOT NULL,
  paid_at             INTEGER
);
CREATE INDEX IF NOT EXISTS idx_orders_email  ON orders (email);
CREATE INDEX IF NOT EXISTS idx_orders_rzp    ON orders (razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status, created_at);

-- Editable site settings (managed from the admin panel).
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Contact form submissions.
CREATE TABLE IF NOT EXISTS contact_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  handled    INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages (created_at);
