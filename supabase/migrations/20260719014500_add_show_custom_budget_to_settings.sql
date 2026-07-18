-- Add show_custom_budget column to quote_form_settings
ALTER TABLE quote_form_settings ADD COLUMN IF NOT EXISTS show_custom_budget boolean DEFAULT true;

-- Update existing settings to default to true
UPDATE quote_form_settings SET show_custom_budget = true WHERE show_custom_budget IS NULL;
