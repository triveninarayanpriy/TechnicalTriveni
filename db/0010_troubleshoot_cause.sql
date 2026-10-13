-- Add cause column to project_troubleshooting
ALTER TABLE project_troubleshooting ADD COLUMN cause TEXT NOT NULL DEFAULT '';
