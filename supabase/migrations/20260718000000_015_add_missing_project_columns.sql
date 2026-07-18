-- Add missing columns to projects table to support new frontend requirements

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS completion_date date,
  ADD COLUMN IF NOT EXISTS cover_image_path text,
  ADD COLUMN IF NOT EXISTS gallery_paths text[],
  ADD COLUMN IF NOT EXISTS before_image_path text,
  ADD COLUMN IF NOT EXISTS after_image_path text;
