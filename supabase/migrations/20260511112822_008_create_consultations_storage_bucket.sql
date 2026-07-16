/*
  # Create consultations storage bucket and policies

  1. New Storage Bucket
    - `consultations` - for storing inspiration images uploaded during consultation booking
  
  2. Storage Policies
    - Allow public uploads (INSERT) to consultations bucket
    - Allow public reads (SELECT) from consultations bucket
    - These are needed because consultation submissions are anonymous (no auth required)
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('consultations', 'consultations', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload consultation images
CREATE POLICY "Anyone can upload consultation images"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'consultations');

-- Allow anyone to read consultation images
CREATE POLICY "Anyone can read consultation images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'consultations');
