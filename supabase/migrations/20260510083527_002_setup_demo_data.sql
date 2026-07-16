/*
  # Setup Demo Data

  Inserts initial analytics data for the dashboard.
  Homepage content will be created through the admin interface.
*/

-- Insert demo analytics data
INSERT INTO analytics (metric_type, metric_name, metric_value, period_date) VALUES
  ('visitors', 'total_visitors', 1250, CURRENT_DATE),
  ('conversion', 'conversion_rate', 8, CURRENT_DATE),
  ('projects', 'published_projects', 12, CURRENT_DATE)
ON CONFLICT DO NOTHING;
