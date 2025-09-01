
-- Create a more flexible RPC function to get clients for owners
CREATE OR REPLACE FUNCTION public.get_all_clients_for_owner(owner_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid, 
  user_id uuid,
  full_name text, 
  name text,
  profile_name text,
  age integer, 
  images text[], 
  profile_images text[],
  occupation text,
  profession text, 
  nationality text, 
  bio text, 
  monthly_income text,
  monthly_income_range text,
  location text, 
  verified boolean,
  interests text[],
  preferences text[],
  preferred_activities text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.id as user_id,
    p.full_name,
    p.full_name as name,
    p.full_name as profile_name,
    p.age,
    p.images,
    p.images as profile_images,
    p.occupation,
    p.occupation as profession,
    p.nationality,
    p.bio,
    p.monthly_income,
    p.monthly_income as monthly_income_range,
    p.location,
    p.verified,
    p.interests,
    COALESCE(p.preferred_activities, ARRAY[]::text[]) as preferences,
    p.preferred_activities
  FROM public.profiles p
  WHERE p.role = 'client'
    AND p.is_active = true
    AND p.onboarding_completed = true
    AND (owner_user_id IS NULL OR p.id != owner_user_id)
  ORDER BY p.created_at DESC
  LIMIT 50;
END;
$$;
