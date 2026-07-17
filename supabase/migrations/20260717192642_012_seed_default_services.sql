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
      ('Artificial Grass Installation', 'High-quality artificial grass installation for a low-maintenance, year-round green lawn.', 'Outdoor & Exterior', 'artificial-grass-installation', true, 1, '00000000-0000-0000-0000-000000000000'),
      ('Bathroom Renovations', 'Complete bathroom renovations tailored to your style and needs, delivering luxury and functionality.', 'Kitchen & Bathroom', 'bathroom-renovations', true, 2, '00000000-0000-0000-0000-000000000000'),
      ('Bathtub Installation', 'Professional bathtub fitting and replacement services, ensuring perfect plumbing and sealing.', 'Kitchen & Bathroom', 'bathtub-installation', true, 3, '00000000-0000-0000-0000-000000000000'),
      ('Block Paving Installation', 'Expert block paving for driveways and paths, providing a durable and attractive finish.', 'Outdoor & Exterior', 'block-paving-installation', true, 4, '00000000-0000-0000-0000-000000000000'),
      ('Driveway Installation', 'Custom driveway installation using premium materials to enhance your property''s curb appeal.', 'Outdoor & Exterior', 'driveway-installation', true, 5, '00000000-0000-0000-0000-000000000000'),
      ('External Door Installation', 'Secure, energy-efficient, and stylish external door fitting services tailored to your property''s aesthetics.', 'Doors & Windows', 'external-door-installation', true, 6, '00000000-0000-0000-0000-000000000000'),
      ('Floor Tiling', 'Precision floor tiling services using ceramic, porcelain, or natural stone for a stunning finish.', 'Tiling & Flooring', 'floor-tiling', true, 7, '00000000-0000-0000-0000-000000000000'),
      ('Garage Conversion', 'Reliable garage conversions to transform your unused space into a functional living area or office.', 'General Building', 'garage-conversion', true, 8, '00000000-0000-0000-0000-000000000000'),
      ('Interior House Painting', 'Expert interior painting and decorating services to refresh and revitalize your property.', 'Painting & Decorating', 'interior-house-painting', true, 9, '00000000-0000-0000-0000-000000000000'),
      ('Internal Door Installation', 'Professional fitting of internal doors, including adjustments, handles, and hinges.', 'Doors & Windows', 'internal-door-installation', true, 10, '00000000-0000-0000-0000-000000000000'),
      ('Kitchen Renovations', 'Complete design and installation services for modern kitchens. Transform your home with our expert team.', 'Kitchen & Bathroom', 'kitchen-renovations', true, 11, '00000000-0000-0000-0000-000000000000'),
      ('Natural Turf Installation', 'Professional laying of fresh, high-quality natural turf for a beautiful, healthy garden.', 'Outdoor & Exterior', 'natural-turf-installation', true, 12, '00000000-0000-0000-0000-000000000000'),
      ('Patio Installation', 'Enhance your outdoor living space with beautiful, durable patio installations.', 'Outdoor & Exterior', 'patio-installation', true, 13, '00000000-0000-0000-0000-000000000000'),
      ('Property Maintenance & Repairs Before Sale or Letting', 'Comprehensive property maintenance and repairs to maximize the value of your home before selling or letting.', 'General Building', 'property-maintenance-and-repairs', true, 14, '00000000-0000-0000-0000-000000000000'),
      ('Skirting Board Installation', 'Expert installation of skirting boards and architraves to give your rooms a polished look.', 'General Building', 'skirting-board-installation', true, 15, '00000000-0000-0000-0000-000000000000'),
      ('Tile Installation', 'High-quality tiling installation for all types of spaces. We ensure a perfect finish that lasts for years.', 'Tiling & Flooring', 'tile-installation', true, 16, '00000000-0000-0000-0000-000000000000'),
      ('Toilet Installation', 'Professional and sanitary toilet installation and replacement services.', 'Kitchen & Bathroom', 'toilet-installation', true, 17, '00000000-0000-0000-0000-000000000000'),
      ('Vinyl Flooring Installation', 'Durable and stylish vinyl flooring installation for kitchens, bathrooms, and living areas.', 'Tiling & Flooring', 'vinyl-flooring-installation', true, 18, '00000000-0000-0000-0000-000000000000'),
      ('Wall Tiling', 'Flawless wall tiling for kitchens and bathrooms, including splashbacks and feature walls.', 'Tiling & Flooring', 'wall-tiling', true, 19, '00000000-0000-0000-0000-000000000000'),
      ('Wallpaper Installation', 'Professional wallpaper hanging for a smooth, seamless finish in any room.', 'Painting & Decorating', 'wallpaper-installation', true, 20, '00000000-0000-0000-0000-000000000000'),
      ('Wash Basin Installation', 'Expert installation of wash basins, vanity units, and associated plumbing.', 'Kitchen & Bathroom', 'wash-basin-installation', true, 21, '00000000-0000-0000-0000-000000000000'),
      ('Water Leak Repairs', 'Fast and reliable repairs for plumbing leaks to prevent water damage.', 'General Building', 'water-leak-repairs', true, 22, '00000000-0000-0000-0000-000000000000'),
      ('Wooden Fence Installation', 'Secure and attractive wooden fencing installation and repairs for your property boundaries.', 'Outdoor & Exterior', 'wooden-fence-installation', true, 23, '00000000-0000-0000-0000-000000000000'),
      ('uPVC Window Installation', 'Energy-efficient and secure uPVC window fitting to improve your home''s insulation and appearance.', 'Doors & Windows', 'upvc-window-installation', true, 24, '00000000-0000-0000-0000-000000000000');
  END IF;
END $$;
