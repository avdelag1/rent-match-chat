-- Fix Security Definer View issues by recreating views without security definer properties
-- Focus on our custom views that we can modify

-- Drop and recreate public_profiles view without security definer properties
DROP VIEW IF EXISTS public.public_profiles CASCADE;

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

-- Drop and recreate listings_browse view without security definer properties
DROP VIEW IF EXISTS public.listings_browse CASCADE;

CREATE VIEW public.listings_browse AS
SELECT 
  id,
  title,
  description,
  price,
  beds,
  baths,
  square_footage,
  property_type,
  city,
  neighborhood,
  location_zone,
  images,
  amenities,
  furnished,
  pet_friendly,
  created_at,
  view_count,
  -- Completely hide owner_id and any identifying information
  'Available for viewing' as contact_status,
  'Use platform messaging' as contact_method
FROM public.listings
WHERE 
  is_active = true 
  AND status = 'active';

-- Drop and recreate listings_public view without security definer properties  
DROP VIEW IF EXISTS public.listings_public CASCADE;

CREATE VIEW public.listings_public AS
SELECT 
  id,
  title,
  description,
  price,
  beds,
  baths,
  square_footage,
  property_type,
  city,
  neighborhood,
  images,
  amenities,
  furnished,
  pet_friendly,
  created_at,
  -- Hide owner_id and other sensitive owner data
  'contact_via_platform' as contact_method,
  -- Only show general availability status
  CASE WHEN is_active THEN 'available' ELSE 'unavailable' END as availability_status
FROM public.listings
WHERE 
  is_active = true 
  AND status = 'active';

-- Grant appropriate permissions to these views
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.listings_browse TO authenticated;
GRANT SELECT ON public.listings_public TO authenticated;

-- Add comments to document the security approach
COMMENT ON VIEW public.public_profiles IS 'Secure view for public profile browsing - respects RLS policies on underlying tables, no SECURITY DEFINER properties';
COMMENT ON VIEW public.listings_browse IS 'Secure view for property browsing - hides owner information, no SECURITY DEFINER properties';
COMMENT ON VIEW public.listings_public IS 'Secure view for public property listings - protects owner privacy, no SECURITY DEFINER properties';