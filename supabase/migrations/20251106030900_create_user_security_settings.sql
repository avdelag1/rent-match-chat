-- Create user_security_settings table for persistent security preferences
CREATE TABLE IF NOT EXISTS user_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_enabled BOOLEAN DEFAULT false,
  login_alerts BOOLEAN DEFAULT true,
  session_timeout BOOLEAN DEFAULT true,
  device_tracking BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own security settings
CREATE POLICY "Users can view own security settings"
  ON user_security_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own security settings
CREATE POLICY "Users can insert own security settings"
  ON user_security_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own security settings
CREATE POLICY "Users can update own security settings"
  ON user_security_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own security settings
CREATE POLICY "Users can delete own security settings"
  ON user_security_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_security_settings_updated_at
  BEFORE UPDATE ON user_security_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_user_security_settings_user_id ON user_security_settings(user_id);
