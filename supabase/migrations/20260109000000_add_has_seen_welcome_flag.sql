-- Add has_seen_welcome flag to profiles table
-- This flag persists server-side to survive localStorage clears
-- Used to ensure welcome message shows only on first signup

-- Add column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'has_seen_welcome'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_seen_welcome boolean DEFAULT false;
    COMMENT ON COLUMN profiles.has_seen_welcome IS 'Whether user has seen the welcome/congratulations message. Set to true after first view to prevent re-showing.';
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_has_seen_welcome ON profiles(has_seen_welcome) WHERE has_seen_welcome = false;
