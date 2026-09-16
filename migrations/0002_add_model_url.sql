-- Optional interactive 3D model (.glb/.gltf URL) shown on featured/detail pages.
ALTER TABLE projects ADD COLUMN model_url TEXT NOT NULL DEFAULT '';
-- Optional "NEW" flag surfaced on cards.
ALTER TABLE projects ADD COLUMN is_new INTEGER NOT NULL DEFAULT 0;
