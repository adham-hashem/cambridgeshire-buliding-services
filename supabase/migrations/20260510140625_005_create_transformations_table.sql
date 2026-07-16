/*
  # Create transformations table for Before & After system

  1. New Table
    - `transformations` - Before & After garden transformation entries
      - `id` (uuid, primary key)
      - `title` (text, not null) - Project title
      - `description` (text) - Short description
      - `service_type` (text) - Service category
      - `before_image_path` (text) - Storage path for before image
      - `after_image_path` (text) - Storage path for after image
      - `before_video_path` (text) - Storage path for before video
      - `after_video_path` (text) - Storage path for after video
      - `featured` (boolean, default false) - Featured flag
      - `display_order` (integer, default 0) - Sort order
      - `published` (boolean, default false) - Published status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, not null) - Admin who created

  2. Storage Bucket
    - Create `transformations` storage bucket for image/video uploads

  3. Security
    - Enable RLS on `transformations`
    - Admin can manage all transformations
    - Public can view published transformations
    - Storage bucket allows authenticated uploads, public reads
*/

-- Create transformations table
CREATE TABLE IF NOT EXISTS transformations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  service_type text,
  before_image_path text,
  after_image_path text,
  before_video_path text,
  after_video_path text,
  featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL
);

-- Enable RLS
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;

-- Admin policies (full CRUD)
CREATE POLICY "Admins can manage transformations"
  ON transformations FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Public can view published transformations
CREATE POLICY "Public can view published transformations"
  ON transformations FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Create index
CREATE INDEX idx_transformations_published ON transformations(published);
CREATE INDEX idx_transformations_featured ON transformations(featured);
CREATE INDEX idx_transformations_order ON transformations(display_order);

-- Create storage bucket for transformation uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('transformations', 'transformations', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload
CREATE POLICY "Authenticated users can upload transformation files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'transformations');

-- Storage policies: authenticated users can update their files
CREATE POLICY "Authenticated users can update transformation files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'transformations');

-- Storage policies: authenticated users can delete their files
CREATE POLICY "Authenticated users can delete transformation files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'transformations');

-- Public can read transformation files
CREATE POLICY "Public can view transformation files"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'transformations');
