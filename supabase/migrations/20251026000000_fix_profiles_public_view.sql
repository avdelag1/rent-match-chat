-- Remove onboarding_completed requirement from profiles_public view
-- This allows profiles to be visible even if onboarding is not complete
-- Addresses issue where owner dashboard shows no client profiles

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
  gender,
  -- Exclude: email, phone, latitude, longitude, income, credit_score,
  -- criminal_background_check, eviction_history, etc.
  created_at,
  onboarding_completed,
  is_active,
  -- Add fields needed for matching
  budget_min,
  budget_max,
  monthly_income,
  has_pets,
  smoking,
  party_friendly
FROM public.profiles
WHERE is_active = true;
-- Removed: AND onboarding_completed = true

-- Grant access to authenticated users for matching/browsing
GRANT SELECT ON public.profiles_public TO authenticated;

COMMENT ON VIEW public.profiles_public IS 'Public view of profiles for discovery - filters only by is_active, not onboarding_completed to allow easier profile discovery';
