-- Add status and reply body to contact_messages
ALTER TABLE contact_messages ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE contact_messages ADD COLUMN reply_body TEXT;

-- Map existing handled to archived
UPDATE contact_messages SET status = 'archived' WHERE handled = 1;
