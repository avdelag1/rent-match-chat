-- Migration: Add comprehensive demographic filters to owner_client_preferences
-- Adds all new filter fields for enhanced client matching

DO $$
BEGIN
  -- Demographics filters
  ALTER TABLE public.owner_client_preferences
    ADD COLUMN IF NOT EXISTS selected_genders TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS selected_nationalities TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS selected_languages TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS selected_relationship_status TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS allows_children BOOLEAN;

  -- Lifestyle habit filters
  ALTER TABLE public.owner_client_preferences
    ADD COLUMN IF NOT EXISTS smoking_habit TEXT DEFAULT 'Any',
    ADD COLUMN IF NOT EXISTS drinking_habit TEXT DEFAULT 'Any',
    ADD COLUMN IF NOT EXISTS cleanliness_level TEXT DEFAULT 'Any',
    ADD COLUMN IF NOT EXISTS noise_tolerance TEXT DEFAULT 'Any',
    ADD COLUMN IF NOT EXISTS work_schedule TEXT DEFAULT 'Any';

  -- Cultural and personality filters
  ALTER TABLE public.owner_client_preferences
    ADD COLUMN IF NOT EXISTS selected_dietary_preferences TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS selected_personality_traits TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS selected_interests TEXT[] DEFAULT '{}';

  RAISE NOTICE 'Owner client preferences table updated with comprehensive filters';
END $$;

-- Create indexes for new array fields for faster filtering
CREATE INDEX IF NOT EXISTS idx_owner_prefs_genders ON public.owner_client_preferences USING GIN(selected_genders);
CREATE INDEX IF NOT EXISTS idx_owner_prefs_nationalities ON public.owner_client_preferences USING GIN(selected_nationalities);
CREATE INDEX IF NOT EXISTS idx_owner_prefs_languages ON public.owner_client_preferences USING GIN(selected_languages);
CREATE INDEX IF NOT EXISTS idx_owner_prefs_dietary ON public.owner_client_preferences USING GIN(selected_dietary_preferences);
CREATE INDEX IF NOT EXISTS idx_owner_prefs_personality ON public.owner_client_preferences USING GIN(selected_personality_traits);
CREATE INDEX IF NOT EXISTS idx_owner_prefs_interests ON public.owner_client_preferences USING GIN(selected_interests);

-- Create indexes for lifestyle fields
CREATE INDEX IF NOT EXISTS idx_owner_prefs_smoking ON public.owner_client_preferences(smoking_habit);
CREATE INDEX IF NOT EXISTS idx_owner_prefs_drinking ON public.owner_client_preferences(drinking_habit);
CREATE INDEX IF NOT EXISTS idx_owner_prefs_cleanliness ON public.owner_client_preferences(cleanliness_level);

COMMENT ON COLUMN public.owner_client_preferences.selected_genders IS 'Array of preferred client genders';
COMMENT ON COLUMN public.owner_client_preferences.selected_nationalities IS 'Array of preferred client nationalities';
COMMENT ON COLUMN public.owner_client_preferences.selected_languages IS 'Array of preferred languages client should speak';
COMMENT ON COLUMN public.owner_client_preferences.selected_relationship_status IS 'Array of acceptable relationship statuses';
COMMENT ON COLUMN public.owner_client_preferences.allows_children IS 'Whether clients with children are allowed';
COMMENT ON COLUMN public.owner_client_preferences.smoking_habit IS 'Acceptable smoking habits (Any, Non-Smoker, Occasional, Regular)';
COMMENT ON COLUMN public.owner_client_preferences.drinking_habit IS 'Acceptable drinking habits (Any, Non-Drinker, Social, Regular)';
COMMENT ON COLUMN public.owner_client_preferences.cleanliness_level IS 'Preferred cleanliness level (Any, Very Clean, Clean, Average, Relaxed)';
COMMENT ON COLUMN public.owner_client_preferences.noise_tolerance IS 'Acceptable noise tolerance level';
COMMENT ON COLUMN public.owner_client_preferences.work_schedule IS 'Preferred work schedule compatibility';
COMMENT ON COLUMN public.owner_client_preferences.selected_dietary_preferences IS 'Array of dietary preferences for compatibility';
COMMENT ON COLUMN public.owner_client_preferences.selected_personality_traits IS 'Array of preferred personality traits';
COMMENT ON COLUMN public.owner_client_preferences.selected_interests IS 'Array of preferred interest categories';
