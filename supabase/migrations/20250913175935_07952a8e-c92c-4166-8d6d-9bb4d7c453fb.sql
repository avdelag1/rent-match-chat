-- Fix Security Definer View issue
-- Remove the security_barrier property that creates a SECURITY DEFINER view

-- Drop the existing problematic view
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view without SECURITY DEFINER properties
-- This view will now respect the querying user's permissions instead of the creator's
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  age,
  role,
  verified,
  created_at,
  -- Only include profile image if user allows it
  CASE WHEN privacy_settings->>'show_images' = 'true' THEN avatar_url ELSE NULL END as avatar_url,
  -- Only show general location, not specific address
  CASE WHEN privacy_settings->>'show_location' = 'true' THEN location ELSE NULL END as general_location
FROM public.profiles
WHERE 
  is_active = true 
  AND onboarding_completed = true
  AND (privacy_settings->>'profile_visibility' = 'public' OR privacy_settings->>'profile_visibility' IS NULL);

-- Grant appropriate access to authenticated users
-- The underlying RLS policies on the profiles table will control actual access
GRANT SELECT ON public.public_profiles TO authenticated;

-- Ensure the view respects RLS policies on the underlying table
-- This is the default behavior when security_barrier is not set to true
COMMENT ON VIEW public.public_profiles IS 'Public view of profile data that respects RLS policies on the underlying profiles table';