/*
# Add budget fields to quote_requests

1. Changes
   - `quote_requests.budget` (text) — selected budget range or "Custom Budget"
   - `quote_requests.custom_budget` (text) — free-text budget when "Custom Budget" is selected

2. Security
   No security changes. RLS policies remain intact.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quote_requests' AND column_name = 'budget') THEN
    ALTER TABLE quote_requests ADD COLUMN budget text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quote_requests' AND column_name = 'custom_budget') THEN
    ALTER TABLE quote_requests ADD COLUMN custom_budget text;
  END IF;
END $$;
