-- Migration 0020: Page Revisions and Custom Source Tracking
ALTER TABLE pages ADD COLUMN is_custom INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS page_revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  source TEXT DEFAULT 'custom',
  note TEXT DEFAULT 'Custom content saved',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_page_revisions_slug ON page_revisions(page_slug, created_at DESC);

-- Mark existing user-customized rows as custom
UPDATE pages SET is_custom = 1 WHERE updated_at != 1700000000 AND content_md != '';
