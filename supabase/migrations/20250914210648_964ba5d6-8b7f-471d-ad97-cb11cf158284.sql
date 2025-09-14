-- Add owner-specific fields to profiles table for enhanced onboarding
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS property_photos text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS property_description text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS property_location text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_of_experience integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS property_specialties text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rental_philosophy text;

-- Update the complete_user_onboarding function to handle owner-specific data
CREATE OR REPLACE FUNCTION public.complete_user_onboarding(user_id uuid, onboarding_data jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update the user's profile with onboarding data
  UPDATE public.profiles 
  SET 
    onboarding_completed = true,
    -- Basic fields for all users
    age = CASE WHEN onboarding_data->>'age' IS NOT NULL THEN (onboarding_data->>'age')::integer ELSE age END,
    bio = COALESCE(onboarding_data->>'bio', bio),
    occupation = COALESCE(onboarding_data->>'occupation', occupation),
    interests = CASE WHEN onboarding_data->'interests' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(onboarding_data->'interests')) ELSE interests END,
    lifestyle_tags = CASE WHEN onboarding_data->'lifestyle_tags' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(onboarding_data->'lifestyle_tags')) ELSE lifestyle_tags END,
    preferred_property_types = CASE WHEN onboarding_data->'preferred_property_types' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(onboarding_data->'preferred_property_types')) ELSE preferred_property_types END,
    budget_min = CASE WHEN onboarding_data->>'budget_min' IS NOT NULL THEN (onboarding_data->>'budget_min')::numeric ELSE budget_min END,
    budget_max = CASE WHEN onboarding_data->>'budget_max' IS NOT NULL THEN (onboarding_data->>'budget_max')::numeric ELSE budget_max END,
    has_pets = CASE WHEN onboarding_data->>'has_pets' IS NOT NULL THEN (onboarding_data->>'has_pets')::boolean ELSE has_pets END,
    smoking = CASE WHEN onboarding_data->>'smoking' IS NOT NULL THEN (onboarding_data->>'smoking')::boolean ELSE smoking END,
    -- Owner-specific fields
    business_type = COALESCE(onboarding_data->>'business_type', business_type),
    property_photos = CASE WHEN onboarding_data->'property_photos' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(onboarding_data->'property_photos')) ELSE property_photos END,
    property_description = COALESCE(onboarding_data->>'property_description', property_description),
    property_location = COALESCE(onboarding_data->>'property_location', property_location),
    contact_phone = COALESCE(onboarding_data->>'contact_phone', contact_phone),
    years_of_experience = CASE WHEN onboarding_data->>'years_of_experience' IS NOT NULL THEN (onboarding_data->>'years_of_experience')::integer ELSE years_of_experience END,
    property_specialties = CASE WHEN onboarding_data->'property_specialties' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(onboarding_data->'property_specialties')) ELSE property_specialties END,
    rental_philosophy = COALESCE(onboarding_data->>'rental_philosophy', rental_philosophy)
  WHERE id = user_id;
END;
$$;