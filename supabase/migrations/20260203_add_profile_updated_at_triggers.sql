-- ============================================
-- ADD UPDATED_AT TRIGGERS TO PROFILE TABLES
-- Date: 2026-02-03
-- Purpose: Enable automatic updated_at tracking for client_profiles and owner_profiles
--          so that recently updated profiles appear first in swipe cards
-- ============================================

-- Ensure client_profiles has updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE client_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Ensure owner_profiles has updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'owner_profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE owner_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Add trigger to client_profiles to auto-update updated_at on changes
DROP TRIGGER IF EXISTS update_client_profiles_updated_at ON public.client_profiles;
CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to owner_profiles to auto-update updated_at on changes
DROP TRIGGER IF EXISTS update_owner_profiles_updated_at ON public.owner_profiles;
CREATE TRIGGER update_owner_profiles_updated_at
  BEFORE UPDATE ON public.owner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for efficient ordering by updated_at
CREATE INDEX IF NOT EXISTS idx_client_profiles_updated_at ON public.client_profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_owner_profiles_updated_at ON public.owner_profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at DESC);

-- Update existing NULL updated_at values to created_at or NOW()
UPDATE client_profiles
SET updated_at = COALESCE(created_at, NOW())
WHERE updated_at IS NULL;

UPDATE owner_profiles
SET updated_at = COALESCE(created_at, NOW())
WHERE updated_at IS NULL;

UPDATE profiles
SET updated_at = COALESCE(created_at, NOW())
WHERE updated_at IS NULL;

-- Add comments for documentation
COMMENT ON TRIGGER update_client_profiles_updated_at ON public.client_profiles IS
  'Automatically updates updated_at timestamp when client profile is modified. Used to show recently updated profiles first in owner swipe cards.';

COMMENT ON TRIGGER update_owner_profiles_updated_at ON public.owner_profiles IS
  'Automatically updates updated_at timestamp when owner profile is modified.';

COMMENT ON INDEX idx_client_profiles_updated_at IS
  'Index for efficient ordering of client profiles by updated_at (DESC) for swipe cards.';

COMMENT ON INDEX idx_profiles_updated_at IS
  'Index for efficient ordering of profiles by updated_at (DESC) for swipe cards.';
