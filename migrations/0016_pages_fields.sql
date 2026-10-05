-- Add publish toggle and SEO fields to pages
ALTER TABLE pages ADD COLUMN published INTEGER NOT NULL DEFAULT 1;
ALTER TABLE pages ADD COLUMN meta_title TEXT;
ALTER TABLE pages ADD COLUMN meta_description TEXT;
