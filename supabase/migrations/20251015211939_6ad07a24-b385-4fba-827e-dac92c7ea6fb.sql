-- Phase 1: Critical Security Fixes

-- 1. Drop insecure SECURITY DEFINER views
-- These views bypass RLS and should use table-level policies instead
DROP VIEW IF EXISTS public.listings_browse CASCADE;
DROP VIEW IF EXISTS public.listings_public CASCADE;

-- 2. Create secure regular views that rely on table RLS policies
-- Users will see only what the listings table RLS allows
CREATE VIEW public.listings_browse AS
SELECT 
  id,
  title,
  price,
  beds,
  baths,
  images,
  amenities,
  property_type,
  city,
  neighborhood,
  description,
  owner_id,
  created_at,
  status,
  is_active
FROM public.listings
WHERE is_active = true AND status = 'active';

CREATE VIEW public.listings_public AS
SELECT 
  id,
  title,
  price,
  beds,
  baths,
  images,
  amenities,
  property_type,
  city,
  neighborhood,
  description,
  created_at,
  status,
  is_active
FROM public.listings  
WHERE is_active = true AND status = 'active';

-- 3. Update critical functions to have explicit secure search_path
-- This prevents search_path injection attacks

CREATE OR REPLACE FUNCTION public.calculate_match_score(client_profile_id uuid, listing_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  score INTEGER DEFAULT 0;
  client_filters RECORD;
  owner_prefs RECORD;
  client_profile RECORD;
  listing_info RECORD;
BEGIN
  -- Get client filter preferences
  SELECT * INTO client_filters 
  FROM public.client_filter_preferences 
  WHERE user_id = client_profile_id;
  
  -- Get owner client preferences for this listing
  SELECT * INTO owner_prefs 
  FROM public.owner_client_preferences 
  WHERE listing_id = listing_id;
  
  -- Get client profile
  SELECT * INTO client_profile 
  FROM public.profiles 
  WHERE id = client_profile_id;
  
  -- Get listing info
  SELECT * INTO listing_info 
  FROM public.listings 
  WHERE id = listing_id;
  
  -- Calculate compatibility score (0-100)
  IF client_filters.min_price <= listing_info.price AND client_filters.max_price >= listing_info.price THEN
    score := score + 20;
  END IF;
  
  IF owner_prefs.min_age <= client_profile.age AND owner_prefs.max_age >= client_profile.age THEN
    score := score + 15;
  END IF;
  
  IF (NOT client_profile.has_pets) OR (client_profile.has_pets AND listing_info.pet_friendly AND owner_prefs.allows_pets) THEN
    score := score + 15;
  END IF;
  
  IF client_profile.lifestyle_tags && owner_prefs.compatible_lifestyle_tags THEN
    score := score + 20;
  END IF;
  
  IF listing_info.property_type = ANY(client_filters.property_types) OR array_length(client_filters.property_types, 1) IS NULL THEN
    score := score + 10;
  END IF;
  
  IF (NOT client_profile.smoking OR NOT owner_prefs.no_smoking) AND
     (NOT client_profile.party_friendly OR owner_prefs.allows_parties) THEN
    score := score + 20;
  END IF;
  
  RETURN score;
END;
$function$;

-- Comment on security improvements
COMMENT ON VIEW public.listings_browse IS 'Secure view relying on table-level RLS policies';
COMMENT ON VIEW public.listings_public IS 'Secure view relying on table-level RLS policies';