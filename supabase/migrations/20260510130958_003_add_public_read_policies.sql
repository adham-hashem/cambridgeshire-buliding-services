/*
  # Add public read access for published content

  1. Security Changes
    - Add SELECT policies for anon and authenticated users on:
      - services (all rows, for public display)
      - projects (published only)
      - testimonials (featured only)
      - garden_journal (published only)
      - consultation_requests (INSERT for anon, so contact form works)
    - These are read-only policies that only expose content meant for public viewing

  2. Important Notes
    - consultation_requests needs an INSERT policy for unauthenticated users
      so the contact form can submit data
    - All other tables remain admin-only for write operations
    - Published/featured filters ensure only approved content is visible
*/

-- Services: public can read all (they are the service catalog)
CREATE POLICY "Public can view services"
  ON services FOR SELECT
  TO anon, authenticated
  USING (true);

-- Projects: public can only see published
CREATE POLICY "Public can view published projects"
  ON projects FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Testimonials: public can see featured
CREATE POLICY "Public can view featured testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (featured = true);

-- Garden journal: public can see published entries
CREATE POLICY "Public can view published journal"
  ON garden_journal FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Consultation requests: allow public inserts (contact form)
CREATE POLICY "Public can submit consultation requests"
  ON consultation_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Newsletter subscribers: allow public inserts
CREATE POLICY "Public can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
