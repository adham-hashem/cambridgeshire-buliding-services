/*
# Ensure Default Services Exist

This migration safely inserts the 24 default services without checking if the table is completely empty.
It checks each service by name to prevent duplicates, allowing it to run even if the user has already manually added some services.
*/

DO $$ 
BEGIN
  -- Insert only if the service doesn't already exist by name
  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Artificial Grass Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Artificial Grass Installation', 'High-quality artificial grass installation for a low-maintenance, year-round green lawn.', 'Outdoor & Exterior', 'artificial-grass-installation', true, 1, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Bathroom Renovations') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Bathroom Renovations', 'Complete bathroom renovations tailored to your style and needs, delivering luxury and functionality.', 'Kitchen & Bathroom', 'bathroom-renovations', true, 2, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Bathtub Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Bathtub Installation', 'Professional bathtub fitting and replacement services, ensuring perfect plumbing and sealing.', 'Kitchen & Bathroom', 'bathtub-installation', true, 3, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Block Paving Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Block Paving Installation', 'Expert block paving for driveways and paths, providing a durable and attractive finish.', 'Outdoor & Exterior', 'block-paving-installation', true, 4, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Driveway Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Driveway Installation', 'Custom driveway installation using premium materials to enhance your property''s curb appeal.', 'Outdoor & Exterior', 'driveway-installation', true, 5, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'External Door Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('External Door Installation', 'Secure, energy-efficient, and stylish external door fitting services tailored to your property''s aesthetics.', 'Doors & Windows', 'external-door-installation', true, 6, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Floor Tiling') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Floor Tiling', 'Precision floor tiling services using ceramic, porcelain, or natural stone for a stunning finish.', 'Tiling & Flooring', 'floor-tiling', true, 7, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Garage Conversion') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Garage Conversion', 'Reliable garage conversions to transform your unused space into a functional living area or office.', 'General Building', 'garage-conversion', true, 8, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Interior House Painting') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Interior House Painting', 'Expert interior painting and decorating services to refresh and revitalize your property.', 'Painting & Decorating', 'interior-house-painting', true, 9, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Internal Door Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Internal Door Installation', 'Professional fitting of internal doors, including adjustments, handles, and hinges.', 'Doors & Windows', 'internal-door-installation', true, 10, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Kitchen Renovations') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Kitchen Renovations', 'Complete design and installation services for modern kitchens. Transform your home with our expert team.', 'Kitchen & Bathroom', 'kitchen-renovations', true, 11, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Natural Turf Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Natural Turf Installation', 'Professional laying of fresh, high-quality natural turf for a beautiful, healthy garden.', 'Outdoor & Exterior', 'natural-turf-installation', true, 12, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Patio Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Patio Installation', 'Enhance your outdoor living space with beautiful, durable patio installations.', 'Outdoor & Exterior', 'patio-installation', true, 13, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Property Maintenance & Repairs Before Sale or Letting') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Property Maintenance & Repairs Before Sale or Letting', 'Comprehensive property maintenance and repairs to maximize the value of your home before selling or letting.', 'General Building', 'property-maintenance-and-repairs', true, 14, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Skirting Board Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Skirting Board Installation', 'Expert installation of skirting boards and architraves to give your rooms a polished look.', 'General Building', 'skirting-board-installation', true, 15, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Tile Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Tile Installation', 'High-quality tiling installation for all types of spaces. We ensure a perfect finish that lasts for years.', 'Tiling & Flooring', 'tile-installation', true, 16, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Toilet Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Toilet Installation', 'Professional and sanitary toilet installation and replacement services.', 'Kitchen & Bathroom', 'toilet-installation', true, 17, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Vinyl Flooring Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Vinyl Flooring Installation', 'Durable and stylish vinyl flooring installation for kitchens, bathrooms, and living areas.', 'Tiling & Flooring', 'vinyl-flooring-installation', true, 18, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Wall Tiling') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Wall Tiling', 'Flawless wall tiling for kitchens and bathrooms, including splashbacks and feature walls.', 'Tiling & Flooring', 'wall-tiling', true, 19, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Wallpaper Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Wallpaper Installation', 'Professional wallpaper hanging for a smooth, seamless finish in any room.', 'Painting & Decorating', 'wallpaper-installation', true, 20, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Wash Basin Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Wash Basin Installation', 'Expert installation of wash basins, vanity units, and associated plumbing.', 'Kitchen & Bathroom', 'wash-basin-installation', true, 21, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Water Leak Repairs') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Water Leak Repairs', 'Fast and reliable repairs for plumbing leaks to prevent water damage.', 'General Building', 'water-leak-repairs', true, 22, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'Wooden Fence Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('Wooden Fence Installation', 'Secure and attractive wooden fencing installation and repairs for your property boundaries.', 'Outdoor & Exterior', 'wooden-fence-installation', true, 23, '00000000-0000-0000-0000-000000000000');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM services WHERE name = 'uPVC Window Installation') THEN
    INSERT INTO services (name, description, category, slug, published, display_order, created_by)
    VALUES ('uPVC Window Installation', 'Energy-efficient and secure uPVC window fitting to improve your home''s insulation and appearance.', 'Doors & Windows', 'upvc-window-installation', true, 24, '00000000-0000-0000-0000-000000000000');
  END IF;
END $$;
