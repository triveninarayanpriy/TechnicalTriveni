-- Gallery items can now be a photo OR a 3D model, ordered together.
ALTER TABLE project_images ADD COLUMN kind TEXT NOT NULL DEFAULT 'image'; -- 'image' | 'model'
