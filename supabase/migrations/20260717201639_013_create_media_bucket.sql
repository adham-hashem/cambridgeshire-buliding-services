/*
  # Create Media Storage Bucket

  1. New Storage Bucket
    - `media` - for storing all media files (images, videos) uploaded via the admin panel.
  
  2. Storage Policies
    - Allow public reads (SELECT) from media bucket so the frontend can display them.
    - Allow authenticated admins to upload (INSERT), update (UPDATE), and delete (DELETE) objects.
*/

-- 1. Create the bucket (safe to run even if it already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Define Policies (drop if they exist to prevent errors on re-runs, then create)
DO $$
BEGIN
    -- Public Read
    DROP POLICY IF EXISTS "Anyone can read media images" ON storage.objects;
    CREATE POLICY "Anyone can read media images"
      ON storage.objects FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'media');

    -- Admin Insert
    DROP POLICY IF EXISTS "Admins can upload media images" ON storage.objects;
    CREATE POLICY "Admins can upload media images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'media');

    -- Admin Update
    DROP POLICY IF EXISTS "Admins can update media images" ON storage.objects;
    CREATE POLICY "Admins can update media images"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'media');

    -- Admin Delete
    DROP POLICY IF EXISTS "Admins can delete media images" ON storage.objects;
    CREATE POLICY "Admins can delete media images"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'media');
END $$;
