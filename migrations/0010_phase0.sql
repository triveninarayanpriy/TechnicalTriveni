-- Phase 0: Trust & safety
ALTER TABLE orders ADD COLUMN is_test INTEGER NOT NULL DEFAULT 0;
