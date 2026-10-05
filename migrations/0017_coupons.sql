-- Add coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  discount_pct INTEGER NOT NULL DEFAULT 0,
  discount_inr INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER,
  created_at INTEGER NOT NULL
);

-- Add email capture subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  unsubscribed INTEGER NOT NULL DEFAULT 0
);
