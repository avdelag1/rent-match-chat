-- Create user_security_settings table for persisting security preferences
-- This table stores security settings for both client and owner users

CREATE TABLE IF NOT EXISTS public.user_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Security settings
  two_factor_enabled BOOLEAN DEFAULT false,
  login_alerts BOOLEAN DEFAULT true,
  session_timeout BOOLEAN DEFAULT true,
  device_tracking BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure one settings row per user
  CONSTRAINT user_security_settings_user_id_key UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id 
ON public.user_security_settings(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_security_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only read and update their own security settings
CREATE POLICY "Users can view their own security settings"
ON public.user_security_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings"
ON public.user_security_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings"
ON public.user_security_settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_user_security_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_security_settings_updated
BEFORE UPDATE ON public.user_security_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_security_settings_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.user_security_settings IS 'Stores user security preferences including 2FA, login alerts, session timeout, and device tracking';
