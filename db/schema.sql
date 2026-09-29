
CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  image_url TEXT,
  updated_at INTEGER NOT NULL
);

