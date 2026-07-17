/*
  # Create quote_requests table

  1. New Table
    - `quote_requests` - stores customer quotation requests.
    - Note: budget and custom_budget columns are added in migration 011.
*/

CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  service_required text,
  message text,
  attachment_paths text[],
  status text DEFAULT 'new',
  internal_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public) to insert a new quote request
CREATE POLICY "Anyone can insert quote_requests"
  ON quote_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated admins to view and manage quote requests
CREATE POLICY "Admins can view all quote_requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update quote_requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete quote_requests"
  ON quote_requests FOR DELETE
  TO authenticated
  USING (true);
