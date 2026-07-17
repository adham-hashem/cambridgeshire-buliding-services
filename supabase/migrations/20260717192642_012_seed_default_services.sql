/*
# Seed Default Services

1. Changes
   - Adds missing columns to `services` table if they don't exist (e.g. `category`, `image_path`, `published`, `slug`, `seo_title`, `seo_description`).
   - Inserts default initial data into the `services` table to ensure the website is not blank after deployment.
   - Includes a check to only insert data if the table is empty, preventing duplicate records if run more than once.

2. Security
   - No security changes. RLS policies remain intact.
*/

DO $$ 
DECLARE
  empty_table boolean;
BEGIN
  -- 1. Ensure required columns exist (in case they were only added via Dashboard previously)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'category') THEN
    ALTER TABLE services ADD COLUMN category text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'image_path') THEN
    ALTER TABLE services ADD COLUMN image_path text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'published') THEN
    ALTER TABLE services ADD COLUMN published boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'slug') THEN
    ALTER TABLE services ADD COLUMN slug text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'seo_title') THEN
    ALTER TABLE services ADD COLUMN seo_title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'seo_description') THEN
    ALTER TABLE services ADD COLUMN seo_description text;
  END IF;

  -- 2. Check if table is empty to prevent duplicates on subsequent deployments
  SELECT NOT EXISTS (SELECT 1 FROM services LIMIT 1) INTO empty_table;

  -- 3. Insert default data only if empty
  IF empty_table THEN
    INSERT INTO services (
      name, 
      description, 
      category, 
      slug, 
      published, 
      display_order, 
      created_by
    )
    VALUES 
      ('Tile Installation', 'High-quality tiling and flooring installation for all types of spaces. We ensure a perfect finish that lasts for years.', 'Tiling & Flooring', 'tile-installation', true, 1, '00000000-0000-0000-0000-000000000000'),
      ('Kitchen Renovations', 'Complete design and installation services for modern kitchens and bathrooms. Transform your home with our expert team.', 'Kitchen & Bathroom', 'kitchen-renovations', true, 2, '00000000-0000-0000-0000-000000000000'),
      ('Interior House Painting', 'Expert interior and exterior painting and decorating services to refresh and revitalize your property.', 'Painting & Decorating', 'interior-house-painting', true, 3, '00000000-0000-0000-0000-000000000000'),
      ('External Door Installation', 'Secure, energy-efficient, and stylish door and window fitting services tailored to your property''s aesthetics.', 'Doors & Windows', 'external-door-installation', true, 4, '00000000-0000-0000-0000-000000000000'),
      ('Patio Installation', 'Enhance your outdoor living space with landscaping, patios, decking, and general exterior maintenance.', 'Outdoor & Exterior', 'patio-installation', true, 5, '00000000-0000-0000-0000-000000000000'),
      ('Garage Conversion', 'Reliable general building, repairs, structural alterations, and home maintenance services you can trust.', 'General Building', 'garage-conversion', true, 6, '00000000-0000-0000-0000-000000000000');
  END IF;
END $$;
