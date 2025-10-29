-- Add comprehensive profile fields to client_profiles table
-- These fields are used in ClientProfileDialog but were missing from the database

-- Demographic fields
ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS relationship_status TEXT,
ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT false;

-- Lifestyle habit fields
ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS smoking_habit TEXT DEFAULT 'Non-Smoker',
ADD COLUMN IF NOT EXISTS drinking_habit TEXT DEFAULT 'Non-Drinker',
ADD COLUMN IF NOT EXISTS cleanliness_level TEXT DEFAULT 'Clean',
ADD COLUMN IF NOT EXISTS noise_tolerance TEXT DEFAULT 'Moderate',
ADD COLUMN IF NOT EXISTS work_schedule TEXT;

-- Cultural and personality fields
ALTER TABLE public.client_profiles
ADD COLUMN IF NOT EXISTS dietary_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS personality_traits TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interest_categories TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN public.client_profiles.nationality IS 'User nationality/country of origin';
COMMENT ON COLUMN public.client_profiles.languages IS 'Array of languages spoken (max 5)';
COMMENT ON COLUMN public.client_profiles.relationship_status IS 'Single, Couple, Family with Children, or Group/Roommates';
COMMENT ON COLUMN public.client_profiles.has_children IS 'Whether the user has children';
COMMENT ON COLUMN public.client_profiles.smoking_habit IS 'Non-Smoker, Occasional Smoker, Regular Smoker, or Vaper Only';
COMMENT ON COLUMN public.client_profiles.drinking_habit IS 'Non-Drinker, Social Drinker, or Regular Drinker';
COMMENT ON COLUMN public.client_profiles.cleanliness_level IS 'Very Clean, Clean, Average, or Relaxed';
COMMENT ON COLUMN public.client_profiles.noise_tolerance IS 'Very Quiet, Moderate, Flexible, or Lively OK';
COMMENT ON COLUMN public.client_profiles.work_schedule IS '9-5 Traditional, Night Shift, Remote Worker, Flexible Hours, Retired, or Student';
COMMENT ON COLUMN public.client_profiles.dietary_preferences IS 'Array of dietary preferences (max 3)';
COMMENT ON COLUMN public.client_profiles.personality_traits IS 'Array of personality traits (max 5)';
COMMENT ON COLUMN public.client_profiles.interest_categories IS 'Array of interest categories (max 6)';
