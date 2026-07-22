ALTER TABLE garden_journal
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS excerpt text;
