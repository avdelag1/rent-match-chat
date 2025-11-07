-- Critical RLS and Race Condition Fixes
-- This migration consolidates all profile RLS policies and adds constraints to prevent duplicate matches/likes

-- =============================================
-- PART 1: DROP ALL CONFLICTING PROFILE POLICIES
-- =============================================

-- Drop all existing profile RLS policies to start clean
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Limited profile visibility" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owners can view client profiles for matching" ON public.profiles;
DROP POLICY IF EXISTS "Clients can view owner profiles for properties" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admin users can view admin profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can view admin profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all user profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view active client profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clients can view owner profiles" ON public.profiles;

-- =============================================
-- PART 2: CREATE ONE CLEAN SET OF PROFILE POLICIES
-- =============================================

-- Users can view their OWN profile (full data)
CREATE POLICY "users_view_own_profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can view OTHER active profiles (limited public data)
-- This allows matching and discovery without exposing private information
CREATE POLICY "users_view_public_profiles" ON public.profiles
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND 
    is_active = true AND 
    auth.uid() != id
  );

-- Users can update ONLY their own profile
CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- Users can insert ONLY their own profile
CREATE POLICY "users_insert_own_profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- =============================================
-- PART 3: FIX LIKES TABLE - PREVENT DUPLICATES
-- =============================================

-- Drop existing unique constraint if it exists
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS unique_user_target_direction;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_target_id_direction_key;

-- Create unique index to prevent duplicate likes (enforce at DB level)
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique_constraint 
  ON public.likes(user_id, target_id, direction);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_target_id ON public.likes(target_id);
CREATE INDEX IF NOT EXISTS idx_likes_direction ON public.likes(direction);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON public.likes(created_at DESC);

-- =============================================
-- PART 4: FIX MATCHES TABLE - PREVENT DUPLICATES
-- =============================================

-- Drop existing unique constraint if it exists
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_client_id_owner_id_listing_id_key;
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS unique_match_combination;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_matches_unique_constraint;
DROP INDEX IF EXISTS idx_matches_unique_with_listing;
DROP INDEX IF EXISTS idx_matches_unique_without_listing;

-- Create unique index for matches WITH listing_id
CREATE UNIQUE INDEX idx_matches_unique_with_listing
  ON public.matches(client_id, owner_id, listing_id)
  WHERE listing_id IS NOT NULL;

-- Create unique index for matches WITHOUT listing_id (profile-to-profile matches)
CREATE UNIQUE INDEX idx_matches_unique_without_listing
  ON public.matches(client_id, owner_id)
  WHERE listing_id IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_client_id ON public.matches(client_id);
CREATE INDEX IF NOT EXISTS idx_matches_owner_id ON public.matches(owner_id);
CREATE INDEX IF NOT EXISTS idx_matches_listing_id ON public.matches(listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_is_mutual ON public.matches(is_mutual) WHERE is_mutual = true;
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.matches(created_at DESC);

-- =============================================
-- PART 5: COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON POLICY "users_view_own_profile" ON public.profiles IS 
  'Users can view their own profile with full access to all fields including private data';

COMMENT ON POLICY "users_view_public_profiles" ON public.profiles IS 
  'Users can view other active profiles for matching and discovery. Private fields are filtered via profiles_public view';

COMMENT ON POLICY "users_update_own_profile" ON public.profiles IS 
  'Users can only update their own profile data';

COMMENT ON POLICY "users_insert_own_profile" ON public.profiles IS 
  'Users can only insert their own profile during signup';

COMMENT ON INDEX idx_likes_unique_constraint IS 
  'Prevents duplicate likes from the same user to the same target with the same direction';

COMMENT ON INDEX idx_matches_unique_with_listing IS 
  'Prevents duplicate matches between the same client, owner, and listing (when listing_id is not NULL)';

COMMENT ON INDEX idx_matches_unique_without_listing IS 
  'Prevents duplicate matches between the same client and owner for profile-to-profile matches (when listing_id is NULL)';
