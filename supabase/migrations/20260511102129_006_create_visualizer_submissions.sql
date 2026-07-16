/*
  # Create Dream Garden Visualizer tables and storage

  1. New Tables
    - `visualizer_submissions` - Stores user submissions for the Dream Garden Visualizer
      - `id` (uuid, primary key)
      - `customer_name` (text, not null)
      - `email` (text, not null)
      - `phone` (text)
      - `postal_address` (text, not null)
      - `garden_style` (text, not null) - Selected garden style
      - `selected_services` (text[]) - Array of selected services
      - `budget` (text) - Estimated project budget
      - `message` (text) - Optional notes
      - `garden_photo_paths` (text[]) - Storage paths for uploaded garden photos
      - `inspiration_photo_paths` (text[]) - Storage paths for inspiration images
      - `ai_result` (jsonb) - AI-generated garden concept result
      - `payment_status` (text, default 'pending') - Payment status
      - `stripe_session_id` (text) - Stripe checkout session ID
      - `status` (text, default 'new') - Submission status
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Storage Bucket
    - Create `visualizer` storage bucket for garden photo uploads

  3. Security
    - Enable RLS on `visualizer_submissions`
    - Allow anon inserts (for the public form)
    - Admin can read all submissions
    - Storage bucket allows anon uploads, public reads
*/

CREATE TABLE IF NOT EXISTS visualizer_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text,
  postal_address text NOT NULL,
  garden_style text NOT NULL,
  selected_services text[] DEFAULT '{}',
  budget text,
  message text,
  garden_photo_paths text[] DEFAULT '{}',
  inspiration_photo_paths text[] DEFAULT '{}',
  ai_result jsonb,
  payment_status text DEFAULT 'pending',
  stripe_session_id text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE visualizer_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form submission)
CREATE POLICY "Anyone can submit visualizer requests"
  ON visualizer_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin can read all submissions
CREATE POLICY "Authenticated users can read visualizer submissions"
  ON visualizer_submissions FOR SELECT
  TO authenticated
  USING (true);

-- Create storage bucket for visualizer uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('visualizer', 'visualizer', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anyone can upload
CREATE POLICY "Anyone can upload visualizer files"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'visualizer');

-- Public can read visualizer files
CREATE POLICY "Public can view visualizer files"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'visualizer');

-- Authenticated can delete
CREATE POLICY "Authenticated users can delete visualizer files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'visualizer');
