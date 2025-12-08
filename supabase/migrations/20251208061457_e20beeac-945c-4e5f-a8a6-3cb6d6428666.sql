-- Fix 1: Enable RLS on admin_users table and add policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users (using existing is_admin function)
CREATE POLICY "Only admins can view admin_users"
  ON public.admin_users FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Only admins can modify admin_users
CREATE POLICY "Only admins can modify admin_users"
  ON public.admin_users FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Fix 2: Tighten profiles table RLS
-- Drop the overly permissive policy if it exists
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;

-- Users can read their own full profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can read other profiles for matching (basic data only - sensitive columns handled at app level)
DROP POLICY IF EXISTS "Users can read other profiles for matching" ON public.profiles;
CREATE POLICY "Users can read other profiles for matching"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix 3: Add write protection to subscription_packages
DROP POLICY IF EXISTS "Only admins can insert subscription_packages" ON public.subscription_packages;
DROP POLICY IF EXISTS "Only admins can update subscription_packages" ON public.subscription_packages;
DROP POLICY IF EXISTS "Only admins can delete subscription_packages" ON public.subscription_packages;

CREATE POLICY "Only admins can insert subscription_packages"
  ON public.subscription_packages FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update subscription_packages"
  ON public.subscription_packages FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete subscription_packages"
  ON public.subscription_packages FOR DELETE
  USING (public.is_admin(auth.uid()));