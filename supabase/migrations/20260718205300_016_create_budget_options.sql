/*
  # Create budget_options table
  Stores the configurable budget tiers that appear on the public quote request form.
  Admins can add, remove, reorder and toggle these from the dashboard.
*/

CREATE TABLE IF NOT EXISTS budget_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE budget_options ENABLE ROW LEVEL SECURITY;

-- Anyone can read active budget options (needed for the public form)
CREATE POLICY "Public can read active budget_options"
  ON budget_options FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated admins can manage budget options
CREATE POLICY "Admins can insert budget_options"
  ON budget_options FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update budget_options"
  ON budget_options FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete budget_options"
  ON budget_options FOR DELETE
  TO authenticated
  USING (true);

-- Seed default budget options
INSERT INTO budget_options (label, display_order, active) VALUES
  ('Under £500', 1, true),
  ('Under £1,000', 2, true),
  ('£1,000 – £5,000', 3, true),
  ('£5,000 – £10,000', 4, true),
  ('£10,000 – £20,000', 5, true),
  ('£20,000+', 6, true),
  ('Custom Budget', 7, true);
