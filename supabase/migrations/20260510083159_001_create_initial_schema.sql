/*
  # Cambridge Garden Services Admin Dashboard Schema

  1. New Tables
    - `projects` - Garden projects with images/videos
    - `consultation_requests` - Customer consultation bookings
    - `testimonials` - Client reviews and ratings
    - `garden_journal` - Blog/newsletter content
    - `services` - Service offerings
    - `homepage_content` - Homepage sections management
    - `newsletter_subscribers` - Email subscribers
    - `media_library` - Centralized media storage
    - `analytics` - Website analytics data
    - `admin_profiles` - Admin user profiles

  2. Security
    - Enable RLS on all tables
    - Admin-only access policies
    - Proper ownership checks
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  status text DEFAULT 'draft',
  featured boolean DEFAULT false,
  service_type text,
  seo_title text,
  seo_description text,
  before_image_id uuid,
  after_image_id uuid,
  video_ids uuid[],
  drone_footage_ids uuid[],
  gallery_image_ids uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL
);

-- Create consultation requests table
CREATE TABLE IF NOT EXISTS consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  service text,
  garden_style text,
  budget_range text,
  inspiration_image_ids uuid[],
  message text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  review_text text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  featured boolean DEFAULT false,
  customer_image_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL
);

-- Create garden journal table
CREATE TABLE IF NOT EXISTS garden_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE,
  content text NOT NULL,
  image_ids uuid[],
  category text,
  published boolean DEFAULT false,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  created_by uuid NOT NULL
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_id uuid,
  featured boolean DEFAULT false,
  display_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL
);

-- Create homepage content table
CREATE TABLE IF NOT EXISTS homepage_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  section_name text,
  hero_headline text,
  hero_subheadline text,
  hero_image_id uuid,
  cta_button_text text,
  cta_button_link text,
  featured_section boolean DEFAULT true,
  content_json jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid NOT NULL
);

-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  status text DEFAULT 'subscribed',
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

-- Create media library table
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  storage_path text NOT NULL,
  file_type text,
  media_type text,
  file_size integer,
  width integer,
  height integer,
  duration integer,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text,
  metric_name text,
  metric_value integer DEFAULT 0,
  period_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create admin profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Admins can manage projects"
  ON projects FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Consultation requests policies
CREATE POLICY "Admins can view all consultation requests"
  ON consultation_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update consultation requests"
  ON consultation_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Testimonials policies
CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Garden journal policies
CREATE POLICY "Admins can manage journal"
  ON garden_journal FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Services policies
CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Homepage content policies
CREATE POLICY "Admins can manage homepage content"
  ON homepage_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Newsletter subscribers policies
CREATE POLICY "Admins can view newsletter subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (true);

-- Media library policies
CREATE POLICY "Admins can manage media"
  ON media_library FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Analytics policies
CREATE POLICY "Admins can view analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (true);

-- Admin profiles policies
CREATE POLICY "Admins can view admin profiles"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update own profile"
  ON admin_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_consultation_status ON consultation_requests(status);
CREATE INDEX idx_testimonials_featured ON testimonials(featured);
CREATE INDEX idx_journal_published ON garden_journal(published);
CREATE INDEX idx_services_order ON services(display_order);
CREATE INDEX idx_media_created_by ON media_library(created_by);
