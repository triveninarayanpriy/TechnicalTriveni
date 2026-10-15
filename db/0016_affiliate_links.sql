-- Migration 0016: Affiliate Links & Verification Queue
CREATE TABLE IF NOT EXISTS component_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  component_id INTEGER NOT NULL UNIQUE,
  store TEXT NOT NULL DEFAULT 'amazon',
  asin TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'unverified', -- 'unverified' | 'verified' | 'search_only' | 'stale' | 'broken'
  confidence REAL NOT NULL DEFAULT 0.0,
  source TEXT NOT NULL DEFAULT 'manual', -- 'gemini' | 'manual'
  grounded INTEGER NOT NULL DEFAULT 0, -- 0 (false) | 1 (true)
  evidence TEXT NOT NULL DEFAULT '{}', -- json string
  verified_at TEXT NOT NULL DEFAULT '',
  verified_by TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_component_links_comp ON component_links(component_id);
CREATE INDEX IF NOT EXISTS idx_component_links_status ON component_links(status);

-- Seed default affiliate settings if not present
INSERT OR IGNORE INTO settings (key, value) VALUES ('affiliate_amazon_domain', 'www.amazon.in');
INSERT OR IGNORE INTO settings (key, value) VALUES ('affiliate_disclosure_text', 'As an Amazon Associate I earn from qualifying purchases.');
INSERT OR IGNORE INTO settings (key, value) VALUES ('affiliate_show_disclosure', '1');
INSERT OR IGNORE INTO settings (key, value) VALUES ('affiliate_custom_stores', '[{"name":"Robu","url_template":"{url}","tag":""}]');
