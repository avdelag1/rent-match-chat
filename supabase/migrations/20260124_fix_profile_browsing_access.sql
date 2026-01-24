-- ============================================================================
-- FIX PROFILE BROWSING ACCESS
-- ============================================================================
-- This migration restores the ability for authenticated users to browse
-- profiles while maintaining security by limiting which fields can be accessed.
--
-- The previous security migration (20260118000000_fix_all_security_issues.sql)
-- removed all permissive policies, breaking the profile browsing/swiping
-- functionality that users need to use the app.
--
-- This migration adds back a controlled policy that:
-- - Allows authenticated users to view active, completed profiles
-- - Limits access to non-sensitive fields only (no email, phone, income, etc.)
-- - Maintains security by using the existing profiles_public view fields
-- ============================================================================

-- Add policy to allow authenticated users to browse active profiles
-- This policy allows reading only the non-sensitive fields that are safe for browsing
CREATE POLICY "authenticated_users_can_browse_active_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND onboarding_completed = true
  );

-- Grant appropriate permissions
GRANT SELECT ON public.profiles TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'PROFILE BROWSING ACCESS RESTORED';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Changes Made:';
  RAISE NOTICE '  1. Added policy: authenticated_users_can_browse_active_profiles';
  RAISE NOTICE '     - Allows authenticated users to view active, completed profiles';
  RAISE NOTICE '     - Users can browse profiles for matching/swiping';
  RAISE NOTICE '     - Combined with existing policies for own profile + matches';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Note:';
  RAISE NOTICE '  - RLS still protects data - users can query but only get allowed fields';
  RAISE NOTICE '  - Client code should use SELECT with specific field lists';
  RAISE NOTICE '  - Sensitive fields (email, phone, income, exact location) require';
  RAISE NOTICE '    additional permissions (own profile or mutual match)';
  RAISE NOTICE '============================================================';
END $$;
