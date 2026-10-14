-- Migration: 0019_message_email_delivery.sql
-- Description: Add email delivery tracking and metadata columns to contact_messages

ALTER TABLE contact_messages ADD COLUMN email_status TEXT NOT NULL DEFAULT 'skipped';
ALTER TABLE contact_messages ADD COLUMN email_sent_at INTEGER DEFAULT NULL;
ALTER TABLE contact_messages ADD COLUMN email_error TEXT DEFAULT '';
ALTER TABLE contact_messages ADD COLUMN email_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contact_messages ADD COLUMN order_id TEXT DEFAULT '';
ALTER TABLE contact_messages ADD COLUMN source_page TEXT DEFAULT '';
