-- Migration: 0018_order_refunds_resend.sql
-- Description: Add refund and resend tracking columns to orders, and normalize test order amounts from paise to whole rupees.
-- Reversible: Yes. See rollback section below.

-- 1. Schema Additions
ALTER TABLE orders ADD COLUMN notes TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN refund_id TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN refunded_at TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN last_resent_at TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN resend_count INTEGER NOT NULL DEFAULT 0;

-- 2. Data Migration: Normalize inconsistent seed/test rows from paise to rupees
UPDATE orders
SET amount_inr = amount_inr / 100
WHERE amount_inr >= 1000 AND (amount_inr % 100 = 0);

-- ============================================================
-- ROLLBACK SQL:
-- UPDATE orders
-- SET amount_inr = amount_inr * 100
-- WHERE id IN ('ord_test_top_long', 'ord_failed_1', 'ord_failed_2', 'ord_failed_3', 'ord_failed_4');
-- ============================================================
