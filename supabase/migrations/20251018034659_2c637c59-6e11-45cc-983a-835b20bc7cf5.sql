-- =====================================================
-- CRITICAL SECURITY FIXES - ERROR LEVEL ISSUES
-- =====================================================

-- =====================================================
-- FIX 1: Add SET search_path to SECURITY DEFINER Functions
-- Protects against search_path hijacking attacks
-- =====================================================

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix update_payment_activations_updated_at
CREATE OR REPLACE FUNCTION public.update_payment_activations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix update_saved_filters_updated_at
CREATE OR REPLACE FUNCTION public.update_saved_filters_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix create_package_usage_for_new_user
CREATE OR REPLACE FUNCTION public.create_package_usage_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Function logic for new user package usage
    INSERT INTO package_usage (user_id, package_id)
    VALUES (NEW.id, (SELECT id FROM subscription_packages WHERE name = 'free' LIMIT 1))
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$function$;

-- Fix update_profiles_updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- =====================================================
-- FIX 2: Enable RLS on user_profiles table
-- Prevents unauthorized access to user profile data
-- =====================================================

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Add owner access policy
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add owner update policy
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add owner insert policy
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Add admin access policy
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (check_is_admin());

-- =====================================================
-- SECURITY IMPROVEMENTS SUMMARY
-- =====================================================
-- ✅ Fixed 5 SECURITY DEFINER functions with mutable search_path
-- ✅ Enabled RLS on user_profiles table with proper policies
-- ✅ Protected against search_path hijacking attacks
-- ✅ Protected against unauthorized profile data access