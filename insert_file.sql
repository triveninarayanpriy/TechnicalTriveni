
INSERT INTO project_files (project_id, label, kind, r2_key, filename, size_bytes, is_free, in_combo, sort, created_at)
VALUES (
  (SELECT id FROM projects WHERE slug = 'free-tools-for-students-india-2026'),
  'Free Tools for Students in India (2026).pdf',
  'document',
  '/downloads/Technical-Triveni_Student-Free-Tools-India-2026.pdf',
  'Technical-Triveni_Student-Free-Tools-India-2026.pdf',
  1600000,
  1,
  0,
  0,
  unixepoch()
);
