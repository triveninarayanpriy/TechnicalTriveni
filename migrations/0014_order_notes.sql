-- Add internal notes to orders
ALTER TABLE orders ADD COLUMN notes TEXT NOT NULL DEFAULT '';
-- Rollback: ALTER TABLE orders DROP COLUMN notes;
