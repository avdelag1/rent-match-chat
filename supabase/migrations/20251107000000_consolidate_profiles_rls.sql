-- Consolidate RLS Policies for Profiles Table
-- This migration drops all conflicting policies and creates a clean set

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
DROP POLICY IF EXISTS "users_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_view_public_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Limited profile visibility for matching" ON public.profiles;

-- =============================================
-- PART 2: CREATE 4 CLEAN, NON-CONFLICTING POLICIES
-- =============================================

-- Policy 1: Users can select their own profile
CREATE POLICY "users_select_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can insert their own profile
CREATE POLICY "users_insert_own_profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Users can select other active profiles for matching
CREATE POLICY "users_select_active_profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    is_active = true AND
    onboarding_completed = true AND
    auth.uid() != id
  );

-- =============================================
-- PART 3: RECREATE PROFILES_PUBLIC VIEW WITH SECURITY_INVOKER
-- =============================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.profiles_public;

-- Create view with security_invoker for proper RLS enforcement
CREATE VIEW public.profiles_public
WITH (security_invoker=true)
AS SELECT 
  id, full_name, age, bio, occupation, nationality, monthly_income, location,
  interests, preferred_activities, lifestyle_tags, images, verified,
  latitude, longitude, avatar_url, has_pets, smoking
FROM public.profiles 
WHERE is_active = true AND onboarding_completed = true;

-- Grant access to authenticated users
GRANT SELECT ON public.profiles_public TO authenticated;

-- =============================================
-- PART 4: FIX LIKES TABLE - PREVENT DUPLICATES
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
-- PART 5: FIX MATCHES TABLE - PREVENT DUPLICATES
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

