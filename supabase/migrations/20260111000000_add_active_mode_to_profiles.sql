-- Migration: Add active_mode column to profiles table
-- Purpose: Enable single app with client/owner mode switching
-- Date: 2026-01-11

-- Add active_mode column to profiles table
-- Defaults to 'client' for existing users
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS active_mode text DEFAULT 'client'
CHECK (active_mode IN ('client', 'owner'));

-- Update existing users: set active_mode based on their role in user_roles table
UPDATE profiles p
SET active_mode = COALESCE(
  (SELECT ur.role FROM user_roles ur WHERE ur.user_id = p.id LIMIT 1),
  'client'
)
WHERE p.active_mode IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_active_mode ON profiles(active_mode);

-- Add updated_at trigger if not exists (for tracking mode changes)
-- The updated_at column should already exist, but ensure trigger fires on mode change

-- Create function to update updated_at timestamp if not exists
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS profiles_updated_at_trigger ON profiles;
CREATE TRIGGER profiles_updated_at_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Add RLS policy for updating own active_mode
-- Users should be able to update their own active_mode
DO $$
BEGIN
  -- Drop existing policy if exists
  DROP POLICY IF EXISTS "Users can update own active_mode" ON profiles;

  -- Create policy allowing users to update their own active_mode
  CREATE POLICY "Users can update own active_mode" ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Policy already exists
END;
$$;

-- Comment for documentation
COMMENT ON COLUMN profiles.active_mode IS 'Current mode the user is operating in: client (browsing deals) or owner (managing listings). Switchable in-app.';
