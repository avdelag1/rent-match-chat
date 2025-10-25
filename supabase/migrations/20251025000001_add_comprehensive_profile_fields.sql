-- Migration: Add comprehensive demographic and lifestyle fields to profiles
-- This supports the new filter system for better client-owner matching

-- Add demographic fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS relationship_status TEXT,
  ADD COLUMN IF NOT EXISTS has_children BOOLEAN,
  ADD COLUMN IF NOT EXISTS number_of_children INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_images TEXT[] DEFAULT '{}';

-- Add lifestyle habit fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS smoking_habit TEXT DEFAULT 'Any',
  ADD COLUMN IF NOT EXISTS drinking_habit TEXT DEFAULT 'Any',
  ADD COLUMN IF NOT EXISTS cleanliness_level TEXT DEFAULT 'Any',
  ADD COLUMN IF NOT EXISTS noise_tolerance TEXT DEFAULT 'Any',
  ADD COLUMN IF NOT EXISTS work_schedule TEXT DEFAULT 'Any',
  ADD COLUMN IF NOT EXISTS has_pets BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pet_types TEXT[] DEFAULT '{}';

-- Add cultural and personality fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dietary_preferences TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS personality_traits TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interest_categories TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS lifestyle_tags TEXT[] DEFAULT '{}';

-- Add location and geo fields for map-based search
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8),
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Add rating and review fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_rate NUMERIC(5, 2) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS response_time_hours INTEGER;

-- Add profile completion tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING gist (
  ll_to_earth(latitude::float8, longitude::float8)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create indexes for common filter queries
CREATE INDEX IF NOT EXISTS idx_profiles_nationality ON public.profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON public.profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON public.profiles(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active, last_active_at DESC);

-- Add GIN indexes for array fields (for faster array containment queries)
CREATE INDEX IF NOT EXISTS idx_profiles_languages ON public.profiles USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_lifestyle_tags ON public.profiles USING GIN(lifestyle_tags);
CREATE INDEX IF NOT EXISTS idx_profiles_dietary_prefs ON public.profiles USING GIN(dietary_preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_personality ON public.profiles USING GIN(personality_traits);
CREATE INDEX IF NOT EXISTS idx_profiles_interest_cats ON public.profiles USING GIN(interest_categories);

-- Create function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(profile_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  completion_score INTEGER := 0;
  total_fields INTEGER := 25;  -- Total number of important fields
BEGIN
  SELECT
    (CASE WHEN name IS NOT NULL AND name != '' THEN 1 ELSE 0 END) +
    (CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END) +
    (CASE WHEN age IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN gender IS NOT NULL AND gender != '' THEN 1 ELSE 0 END) +
    (CASE WHEN nationality IS NOT NULL AND nationality != '' THEN 1 ELSE 0 END) +
    (CASE WHEN array_length(languages, 1) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN relationship_status IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN city IS NOT NULL AND city != '' THEN 1 ELSE 0 END) +
    (CASE WHEN country IS NOT NULL AND country != '' THEN 1 ELSE 0 END) +
    (CASE WHEN profile_photo IS NOT NULL AND profile_photo != '' THEN 1 ELSE 0 END) +
    (CASE WHEN array_length(profile_images, 1) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN smoking_habit IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN drinking_habit IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN cleanliness_level IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN work_schedule IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN array_length(dietary_preferences, 1) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN array_length(personality_traits, 1) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN array_length(interest_categories, 1) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN occupation IS NOT NULL AND occupation != '' THEN 1 ELSE 0 END) +
    (CASE WHEN array_length(lifestyle_tags, 1) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN array_length(interests, 1) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN verified THEN 2 ELSE 0 END) +  -- Verification worth 2 points
    (CASE WHEN average_rating > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN response_rate > 0 THEN 1 ELSE 0 END)
  INTO completion_score
  FROM public.profiles
  WHERE id = profile_id;

  RETURN (completion_score * 100 / total_fields);
END;
$$;

-- Create trigger to auto-update profile completion percentage
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.profile_completion_percentage := public.calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_profile_completion ON public.profiles;
CREATE TRIGGER trg_update_profile_completion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_completion();

-- Update existing profiles to calculate their completion percentage
UPDATE public.profiles
SET profile_completion_percentage = public.calculate_profile_completion(id)
WHERE profile_completion_percentage = 0;

COMMENT ON TABLE public.profiles IS 'User profiles with comprehensive demographic, lifestyle, and location data for advanced matching';
COMMENT ON COLUMN public.profiles.nationality IS 'User nationality for cultural matching';
COMMENT ON COLUMN public.profiles.languages IS 'Array of languages the user speaks';
COMMENT ON COLUMN public.profiles.profile_images IS 'Array of profile image URLs';
COMMENT ON COLUMN public.profiles.smoking_habit IS 'Smoking preferences: Any, Non-Smoker, Occasional, Regular, Vaper Only';
COMMENT ON COLUMN public.profiles.drinking_habit IS 'Drinking preferences: Any, Non-Drinker, Social, Regular';
COMMENT ON COLUMN public.profiles.cleanliness_level IS 'Cleanliness standard: Any, Very Clean, Clean, Average, Relaxed';
COMMENT ON COLUMN public.profiles.profile_completion_percentage IS 'Auto-calculated profile completion (0-100%)';
