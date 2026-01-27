-- ============================================================================
-- EMERGENCY FIX: LIKES NOT SAVING ISSUE
-- ============================================================================
-- Date: 2026-01-27
-- Issue: Users cannot save likes when they swipe right
-- Root Cause: is_user_active() function returns NULL for new users,
--             blocking RLS policies that require it to be TRUE
--
-- This script fixes:
--   1. is_user_active() to return TRUE for new users without profiles
--   2. Profiles SELECT policy to allow viewing without onboarding_completed
--   3. Allows all authenticated users to save likes immediately
-- ============================================================================

-- ============================================================================
-- FIX 1: is_user_active() - Allow new users without profiles
-- ============================================================================

DROP FUNCTION IF EXISTS public.is_user_active(UUID);

CREATE OR REPLACE FUNCTION public.is_user_active(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (
      SELECT
        NOT COALESCE(is_suspended, false)
        AND NOT COALESCE(is_blocked, false)
      FROM public.profiles
      WHERE id = user_uuid
    ),
    -- If no profile exists yet, return TRUE (allow new users to use the app)
    true
  );
$$;

COMMENT ON FUNCTION public.is_user_active IS
  'Check if user is active (not suspended or blocked). Returns TRUE for new users without profiles.';

-- ============================================================================
-- FIX 2: Profiles SELECT Policy - Allow viewing profiles without onboarding
-- ============================================================================

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "users_select_active_profiles" ON public.profiles;

-- Create new policy that doesn't require onboarding_completed
-- This allows new users to see other user profiles and photos immediately
CREATE POLICY "users_select_active_profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    COALESCE(is_active, true) = true AND  -- Allow if is_active is NULL or true
    auth.uid() != id  -- Can't view own profile through this policy (use users_select_own_profile)
  );

COMMENT ON POLICY "users_select_active_profiles" ON public.profiles IS
  'Allow authenticated users to view active profiles. Does not require onboarding_completed to support new users viewing the app immediately after signup.';

-- ============================================================================
-- FIX 3: Verify and update likes table RLS policies (if needed)
-- ============================================================================

-- These policies should already exist, but let's ensure they work correctly
-- Drop existing policies first
DROP POLICY IF EXISTS "users can read their own likes" ON public.likes;
DROP POLICY IF EXISTS "users can like listings" ON public.likes;
DROP POLICY IF EXISTS "users can unlike" ON public.likes;
DROP POLICY IF EXISTS "owners can see likes on their listings" ON public.likes;

-- Recreate with corrected is_user_active checks
CREATE POLICY "users can read their own likes"
ON public.likes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "users can like listings"
ON public.likes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND public.is_user_active(auth.uid())  -- Now returns TRUE for new users!
);

CREATE POLICY "users can unlike"
ON public.likes
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "owners can see likes on their listings"
ON public.likes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.listings
    WHERE listings.id = likes.target_listing_id
    AND listings.owner_id = auth.uid()
  )
);

-- ============================================================================
-- FIX 4: Verify and update owner_likes table RLS policies (if needed)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "owners can read their own likes" ON public.owner_likes;
DROP POLICY IF EXISTS "owners can insert likes" ON public.owner_likes;
DROP POLICY IF EXISTS "owners can delete their own likes" ON public.owner_likes;
DROP POLICY IF EXISTS "clients can see who liked them" ON public.owner_likes;

-- Recreate with corrected is_user_active checks
CREATE POLICY "owners can read their own likes"
ON public.owner_likes
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "owners can insert likes"
ON public.owner_likes
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id
  AND public.is_user_active(auth.uid())  -- Now returns TRUE for new users!
);

CREATE POLICY "owners can delete their own likes"
ON public.owner_likes
FOR DELETE
USING (auth.uid() = owner_id);

CREATE POLICY "clients can see who liked them"
ON public.owner_likes
FOR SELECT
USING (auth.uid() = client_id);

-- ============================================================================
-- VERIFICATION AND TESTING
-- ============================================================================

DO $$
DECLARE
  test_result BOOLEAN;
  random_uuid UUID := gen_random_uuid();
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'LIKES SAVE FIX APPLIED SUCCESSFULLY';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';

  -- Test is_user_active with non-existent user
  test_result := public.is_user_active(random_uuid);
  RAISE NOTICE 'TEST: is_user_active for non-existent user = % (should be TRUE)', test_result;

  RAISE NOTICE '';
  RAISE NOTICE 'Fixes Applied:';
  RAISE NOTICE '  ✓ is_user_active() now returns TRUE for users without profiles';
  RAISE NOTICE '  ✓ Profile SELECT policy no longer requires onboarding_completed';
  RAISE NOTICE '  ✓ Likes table RLS policies updated to use fixed is_user_active()';
  RAISE NOTICE '  ✓ Owner_likes table RLS policies updated to use fixed is_user_active()';
  RAISE NOTICE '';
  RAISE NOTICE 'What this fixes:';
  RAISE NOTICE '  1. Users can now swipe right and SAVE likes immediately';
  RAISE NOTICE '  2. Owners can swipe on clients without RLS errors';
  RAISE NOTICE '  3. Likes persist after page refresh';
  RAISE NOTICE '  4. New users (including Google sign-ups) can use the app instantly';
  RAISE NOTICE '';
  RAISE NOTICE 'How to test:';
  RAISE NOTICE '  1. Log in as any user (new or existing)';
  RAISE NOTICE '  2. Swipe right on a listing or profile';
  RAISE NOTICE '  3. Check that the like is saved (no error messages)';
  RAISE NOTICE '  4. Refresh the page';
  RAISE NOTICE '  5. Verify the liked item appears in your "Liked" list';
  RAISE NOTICE '============================================================';
END $$;
