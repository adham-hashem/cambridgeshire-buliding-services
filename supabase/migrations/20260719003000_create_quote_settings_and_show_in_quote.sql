-- Add show_in_quote column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS show_in_quote boolean DEFAULT true;

-- Update services table policies to allow any authenticated user to manage services
DROP POLICY IF EXISTS "Admins can manage services" ON services;
CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create quote_form_settings table
CREATE TABLE IF NOT EXISTS quote_form_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_email boolean DEFAULT true,
  require_email boolean DEFAULT false,
  show_budget boolean DEFAULT true,
  require_budget boolean DEFAULT true,
  show_message boolean DEFAULT true,
  require_message boolean DEFAULT false,
  show_attachments boolean DEFAULT true,
  require_attachments boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on quote_form_settings
ALTER TABLE quote_form_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for public form)
CREATE POLICY "Public can view quote_form_settings"
  ON quote_form_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated admins can manage quote_form_settings
CREATE POLICY "Admins can manage quote_form_settings"
  ON quote_form_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed default quote form settings
INSERT INTO quote_form_settings (
  show_email, require_email,
  show_budget, require_budget,
  show_message, require_message,
  show_attachments, require_attachments
) VALUES (
  true, false,
  true, true,
  true, false,
  true, false
);
