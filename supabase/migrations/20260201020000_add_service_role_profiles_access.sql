-- ============================================
-- Allow service_role to read/write profiles
--
-- The handle_new_user trigger runs as service_role.  Previous
-- migrations only granted INSERT access to authenticated users
-- (WITH CHECK (auth.uid() = id)), so the trigger's INSERT would
-- be blocked by RLS on a cold database where no profile exists yet.
--
-- This migration replaces the three core profiles policies with
-- versions that also permit service_role, keeping the existing
-- "Public profiles are viewable by everyone" SELECT policy intact.
-- ============================================

-- INSERT – let service_role create profiles during signup
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- SELECT – service_role can read any profile (needed by RPCs)
DROP POLICY IF EXISTS "service_role can read profiles" ON public.profiles;
CREATE POLICY "service_role can read profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'service_role');

-- UPDATE – service_role can update any profile (needed by RPCs)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING  (auth.uid() = id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');
