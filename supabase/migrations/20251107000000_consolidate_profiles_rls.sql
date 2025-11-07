-- Consolidate and fix RLS policies on profiles table
-- This migration removes all conflicting policies and creates a clean, simple set

-- Drop all existing policies on profiles table
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Create consolidated, non-conflicting RLS policies
-- 1. Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Authenticated users can insert their own profile (for signup)
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. Users can view active profiles of other users (for matching/discovery)
-- This allows owners to see clients and vice versa
CREATE POLICY "profiles_select_active_others"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    AND id != auth.uid()
  );

-- Ensure profiles_public view exists and has proper grants
DROP VIEW IF EXISTS public.profiles_public CASCADE;

CREATE VIEW public.profiles_public
WITH (security_invoker=true)
AS
SELECT
  id,
  full_name,
  age,
  bio,
  occupation,
  interests,
  lifestyle_tags,
  preferred_activities,
  images,
  avatar_url,
  verified,
  city,
  gender,
  created_at,
  onboarding_completed,
  is_active,
  budget_min,
  budget_max,
  monthly_income,
  has_pets,
  smoking,
  party_friendly
FROM public.profiles
WHERE is_active = true;

-- Grant access to authenticated users
GRANT SELECT ON public.profiles_public TO authenticated;

COMMENT ON VIEW public.profiles_public IS 'Consolidated public view of profiles for discovery - shows all active profiles';
