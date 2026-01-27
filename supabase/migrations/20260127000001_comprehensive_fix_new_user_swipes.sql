-- ============================================================================
-- COMPREHENSIVE FIX FOR NEW USER SWIPE AND PROFILE VISIBILITY ISSUES
-- ============================================================================
-- Date: 2026-01-27
-- Purpose: Fix multiple RLS issues preventing new Google users from using the app
--
-- Problems Fixed:
-- 1. is_user_active() returns NULL for new users → blocks swipe saves
-- 2. profiles SELECT policy requires onboarding_completed → users can't see photos
-- 3. New users can't save likes (client side)
-- 4. New users get RLS errors when swiping (owner side)
--
-- Root Cause:
-- - RLS policies were too restrictive for new users
-- - Required complete profiles before allowing basic app functionality
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
-- FIX 3: Verify storage bucket policies exist for profile images
-- ============================================================================

-- Note: Storage policies are managed separately in Supabase Storage
-- If images still don't load, check Storage > Policies in Supabase Dashboard
-- Required policies:
-- 1. "Public Access" on avatars bucket for SELECT
-- 2. "Authenticated users can upload avatars" for INSERT
-- 3. "Users can update own avatars" for UPDATE

-- ============================================================================
-- VERIFICATION AND TESTING
-- ============================================================================

DO $$
DECLARE
  test_result BOOLEAN;
  random_uuid UUID := gen_random_uuid();
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'COMPREHENSIVE FIX APPLIED FOR NEW USER ISSUES';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';

  -- Test is_user_active with non-existent user
  test_result := public.is_user_active(random_uuid);
  RAISE NOTICE 'TEST: is_user_active for non-existent user = % (should be TRUE)', test_result;

  RAISE NOTICE '';
  RAISE NOTICE 'Fixes Applied:';
  RAISE NOTICE '  ✓ is_user_active() now returns TRUE for users without profiles';
  RAISE NOTICE '  ✓ Profile SELECT policy no longer requires onboarding_completed';
  RAISE NOTICE '  ✓ New users can now view other profiles and photos immediately';
  RAISE NOTICE '  ✓ New users can save likes on both client and owner sides';
  RAISE NOTICE '';
  RAISE NOTICE 'What to test:';
  RAISE NOTICE '  1. New Google user logs in';
  RAISE NOTICE '  2. Can see client/listing photos in swipe cards';
  RAISE NOTICE '  3. Can swipe right and save likes (client side)';
  RAISE NOTICE '  4. Can swipe on clients without errors (owner side)';
  RAISE NOTICE '  5. Likes persist after page refresh';
  RAISE NOTICE '';
  RAISE NOTICE 'If images still do not load:';
  RAISE NOTICE '  - Check Supabase Dashboard > Storage > Policies';
  RAISE NOTICE '  - Ensure public read access on avatars/profile-images buckets';
  RAISE NOTICE '============================================================';
END $$;
