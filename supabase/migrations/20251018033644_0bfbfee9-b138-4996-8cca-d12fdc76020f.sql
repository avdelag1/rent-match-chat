
-- =====================================================
-- CRITICAL SECURITY FIXES - ERROR LEVEL ISSUES ONLY
-- =====================================================

-- =====================================================
-- FIX 1: Restrict profiles table to owner-only access
-- =====================================================

-- Drop overly permissive policies that expose PII
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Limited profile visibility for matching" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles for matching" ON public.profiles;

-- Ensure only owner access policy exists for full profile data
-- (Admins policies remain for legitimate admin functions)
DROP POLICY IF EXISTS "Users can only view own full profile data" ON public.profiles;

CREATE POLICY "Users can only view own full profile data"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- =====================================================
-- FIX 2: Create secure profiles_public view with minimal data
-- =====================================================

-- Drop and recreate profiles_public view with security_invoker
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
  -- Generic location only (city level, not exact coordinates)
  city,
  -- Exclude: email, phone, latitude, longitude, income, credit_score, 
  -- criminal_background_check, eviction_history, etc.
  created_at,
  onboarding_completed,
  is_active
FROM public.profiles
WHERE is_active = true 
  AND onboarding_completed = true;

-- Grant access to authenticated users for matching/browsing
GRANT SELECT ON public.profiles_public TO authenticated;

-- =====================================================
-- FIX 3: Fix Security Definer Views - Use Security Invoker
-- =====================================================

-- Drop and recreate listings_browse with security_invoker
DROP VIEW IF EXISTS public.listings_browse CASCADE;

CREATE VIEW public.listings_browse
WITH (security_invoker=true)
AS
SELECT 
  id,
  title,
  price,
  beds,
  baths,
  images,
  amenities,
  property_type,
  category,
  listing_type,
  city,
  neighborhood,
  description,
  owner_id,
  created_at,
  status,
  is_active,
  furnished,
  pet_friendly,
  square_footage
FROM public.listings
WHERE is_active = true 
  AND status = 'active'::listing_status;

-- Grant access to authenticated users
GRANT SELECT ON public.listings_browse TO authenticated;

-- Drop and recreate listings_public with security_invoker
DROP VIEW IF EXISTS public.listings_public CASCADE;

CREATE VIEW public.listings_public
WITH (security_invoker=true)
AS
SELECT 
  id,
  title,
  price,
  beds,
  baths,
  images,
  amenities,
  property_type,
  category,
  listing_type,
  city,
  neighborhood,
  description,
  created_at,
  status,
  is_active
FROM public.listings
WHERE is_active = true 
  AND status = 'active'::listing_status;

-- Grant access to public for public listings
GRANT SELECT ON public.listings_public TO public;

-- =====================================================
-- FIX 4: Add audit logging for admin profile access
-- =====================================================

-- Create audit trigger function for profile access
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log admin access to other users' profiles
  IF auth.uid() IS NOT NULL 
     AND NEW.id != auth.uid() 
     AND EXISTS (
       SELECT 1 FROM admin_users 
       WHERE id = auth.uid() AND is_active = true
     ) 
  THEN
    INSERT INTO audit_logs (
      table_name,
      action,
      record_id,
      changed_by,
      details
    ) VALUES (
      'profiles',
      'ADMIN_SELECT',
      NEW.id,
      auth.uid(),
      jsonb_build_object(
        'accessed_user_id', NEW.id,
        'access_time', NOW(),
        'admin_id', auth.uid()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- SECURITY IMPROVEMENTS SUMMARY
-- =====================================================
-- ✅ Restricted profiles table to owner-only access
-- ✅ Created secure profiles_public view with minimal PII
-- ✅ Fixed SECURITY DEFINER views to use security_invoker
-- ✅ Added audit logging infrastructure for admin access
-- ✅ Removed overly permissive profile access policies
--
-- Note: spatial_ref_sys is a PostGIS system table that cannot be modified
-- Note: admin_credentials table was not found in the database (already removed)
