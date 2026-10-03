ALTER TABLE projects ADD COLUMN layout_version INTEGER DEFAULT 1;
ALTER TABLE projects ADD COLUMN prereqs_json TEXT DEFAULT '[]';
ALTER TABLE projects ADD COLUMN not_included_json TEXT DEFAULT '[]';
ALTER TABLE projects ADD COLUMN outcomes_json TEXT DEFAULT '[]';
ALTER TABLE projects ADD COLUMN faq_json TEXT DEFAULT '[]';
ALTER TABLE projects ADD COLUMN changelog TEXT DEFAULT '';

ALTER TABLE bom_items ADD COLUMN group_name TEXT DEFAULT '';
ALTER TABLE bom_items ADD COLUMN stage_tag TEXT DEFAULT '';

ALTER TABLE project_files ADD COLUMN stage_tag TEXT DEFAULT '';
