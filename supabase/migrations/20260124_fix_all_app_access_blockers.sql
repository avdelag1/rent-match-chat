-- ============================================================================
-- FIX ALL APP ACCESS BLOCKERS - COMPREHENSIVE RLS POLICY FIX
-- ============================================================================
-- This migration fixes ALL the RLS policies that are blocking app access.
--
-- PROBLEM:
-- The security hardening migration (20260118000000_fix_all_security_issues.sql)
-- removed permissive policies but didn't add essential INSERT/UPDATE policies.
-- This prevents users from:
-- 1. Creating their profile during signup (INSERT blocked)
-- 2. Updating their profile (UPDATE blocked)
-- 3. Browsing other profiles (SELECT blocked)
-- 4. Reading their own role from user_roles (SELECT blocked in some cases)
--
-- SOLUTION:
-- Add all necessary policies for normal app functionality while maintaining
-- security by ensuring users can only modify their own data.
-- ============================================================================

-- ============================================================================
-- PART 1: PROFILES TABLE - Add INSERT and UPDATE policies
-- ============================================================================

-- Allow users to insert their own profile during signup
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
CREATE POLICY "users_insert_own_profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure users can select their own profile (should already exist but let's be sure)
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
CREATE POLICY "users_select_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Add policy to allow authenticated users to browse active profiles (for matching/swiping)
DROP POLICY IF EXISTS "authenticated_users_can_browse_active_profiles" ON public.profiles;
CREATE POLICY "authenticated_users_can_browse_active_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND onboarding_completed = true
  );

-- ============================================================================
-- PART 2: USER_ROLES TABLE - Ensure users can read their own role
-- ============================================================================

-- This is CRITICAL for Index.tsx which queries user_roles on every app load
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "users_view_own_role" ON public.user_roles;
CREATE POLICY "users_view_own_role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 3: GRANT NECESSARY TABLE PERMISSIONS
-- ============================================================================

-- Ensure authenticated users have SELECT permission on profiles
GRANT SELECT ON public.profiles TO authenticated;

-- Ensure authenticated users have INSERT permission on profiles (for signup)
GRANT INSERT ON public.profiles TO authenticated;

-- Ensure authenticated users have UPDATE permission on profiles (for profile edits)
GRANT UPDATE ON public.profiles TO authenticated;

-- Ensure authenticated users have SELECT permission on user_roles
GRANT SELECT ON public.user_roles TO authenticated;

-- ============================================================================
-- VERIFICATION QUERY (Run this after migration to verify)
-- ============================================================================

-- To verify policies are active, run:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename IN ('profiles', 'user_roles')
-- ORDER BY tablename, policyname;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'ALL APP ACCESS BLOCKERS FIXED';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Changes Made:';
  RAISE NOTICE '';
  RAISE NOTICE 'PROFILES TABLE:';
  RAISE NOTICE '  ✓ users_insert_own_profile - Users can create their profile';
  RAISE NOTICE '  ✓ users_update_own_profile - Users can update their profile';
  RAISE NOTICE '  ✓ users_select_own_profile - Users can view their own profile';
  RAISE NOTICE '  ✓ authenticated_users_can_browse_active_profiles - Browse for matching';
  RAISE NOTICE '';
  RAISE NOTICE 'USER_ROLES TABLE:';
  RAISE NOTICE '  ✓ users_view_own_role - Users can view their role';
  RAISE NOTICE '';
  RAISE NOTICE 'PERMISSIONS GRANTED:';
  RAISE NOTICE '  ✓ SELECT, INSERT, UPDATE on profiles';
  RAISE NOTICE '  ✓ SELECT on user_roles';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Notes:';
  RAISE NOTICE '  - Users can only modify their OWN data (auth.uid() = id)';
  RAISE NOTICE '  - Users can only browse active, completed profiles';
  RAISE NOTICE '  - Sensitive PII still protected (requires mutual match)';
  RAISE NOTICE '  - Role changes still blocked (no INSERT/UPDATE on user_roles)';
  RAISE NOTICE '============================================================';
END $$;
