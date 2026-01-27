-- ============================================================================
-- FIX is_user_active FOR NEW GOOGLE USERS
-- ============================================================================
-- Date: 2026-01-27
-- Purpose: Fix the is_user_active function to allow new users to swipe
--          even if their profile isn't fully initialized yet
--
-- Issue: New Google users can't save swipes because is_user_active returns NULL
--        when the profile doesn't exist or fields are NULL
--
-- Solution: Return TRUE for users who:
--   1. Don't have a profile yet (new users)
--   2. Have a profile but is_suspended/is_blocked are NULL (default state)
--   3. Have a profile and are explicitly not suspended/blocked
-- ============================================================================

-- Drop the old function
DROP FUNCTION IF EXISTS public.is_user_active(UUID);

-- Create improved version that handles NULL cases
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
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'FIX APPLIED: is_user_active now returns TRUE for new users';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'This fixes:';
  RAISE NOTICE '  - New Google users unable to save property likes';
  RAISE NOTICE '  - New Google users getting RLS errors when swiping on clients';
  RAISE NOTICE '  - Likes disappearing on refresh for new users';
  RAISE NOTICE '';
  RAISE NOTICE 'How it works:';
  RAISE NOTICE '  - If user has no profile: returns TRUE (allows swipes)';
  RAISE NOTICE '  - If user has profile with NULL flags: returns TRUE (allows swipes)';
  RAISE NOTICE '  - If user is explicitly suspended/blocked: returns FALSE (blocks swipes)';
  RAISE NOTICE '============================================================';
END $$;
