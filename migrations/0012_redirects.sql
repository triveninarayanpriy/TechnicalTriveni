CREATE TABLE IF NOT EXISTS redirects (
  old_path TEXT PRIMARY KEY,
  new_path TEXT NOT NULL
);
