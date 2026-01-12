-- Add active_mode column to profiles table for unified user switching
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS active_mode text DEFAULT 'client'
CHECK (active_mode IN ('client', 'owner'));

-- Update existing users based on their role in user_roles table
UPDATE profiles p
SET active_mode = COALESCE(
  (SELECT ur.role FROM user_roles ur WHERE ur.user_id = p.id LIMIT 1),
  'client'
)
WHERE p.active_mode IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_active_mode ON profiles(active_mode);