-- Site Assets and Revisions Table
CREATE TABLE IF NOT EXISTS site_assets_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_json TEXT NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL
);
