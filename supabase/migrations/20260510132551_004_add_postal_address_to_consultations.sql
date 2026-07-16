/*
  # Add postal_address column to consultation_requests

  1. Changes
    - Add `postal_address` text column to `consultation_requests` table
    - This is required for the booking form's "Full Postal Address" field

  2. Security
    - No security changes needed
    - The existing INSERT policy for anon users already allows inserting all columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultation_requests' AND column_name = 'postal_address'
  ) THEN
    ALTER TABLE consultation_requests ADD COLUMN postal_address text;
  END IF;
END $$;
