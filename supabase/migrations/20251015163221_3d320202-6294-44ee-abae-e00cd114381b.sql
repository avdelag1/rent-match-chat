-- Fix infinite recursion in user_profiles RLS policies

-- Step 1: Drop all existing RLS policies on user_profiles to stop the recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;

-- Step 2: Create a security definer function to check if user owns the profile
-- This prevents RLS recursion by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = profile_user_id;
$$;

-- Step 3: Create a security definer function to check admin access
-- Reusing existing is_admin function or creating if needed
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
    AND is_active = true
  );
$$;

-- Step 4: Recreate RLS policies using security definer functions (no recursion)

-- Users can view their own profile
CREATE POLICY "Users can view own user profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_profile_owner(user_id));

-- Users can insert their own profile
CREATE POLICY "Users can insert own user profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_profile_owner(user_id));

-- Users can update their own profile
CREATE POLICY "Users can update own user profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_profile_owner(user_id))
WITH CHECK (public.is_profile_owner(user_id));

-- Admins can view all profiles
CREATE POLICY "Admins can view all user profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.check_is_admin());

-- Admins can manage all profiles
CREATE POLICY "Admins can manage all user profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.check_is_admin())
WITH CHECK (public.check_is_admin());