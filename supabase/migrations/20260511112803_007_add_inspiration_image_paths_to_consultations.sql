/*
  # Add inspiration_image_paths to consultation_requests

  1. Modified Tables
    - `consultation_requests`
      - Added `inspiration_image_paths` (text[], nullable) to store uploaded inspiration image storage paths
  
  2. Security
    - No RLS policy changes needed - table already has RLS enabled
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultation_requests' AND column_name = 'inspiration_image_paths'
  ) THEN
    ALTER TABLE consultation_requests ADD COLUMN inspiration_image_paths text[] DEFAULT '{}';
  END IF;
END $$;
