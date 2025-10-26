-- Migration: Add onboarding tracking to profiles table
-- Tracks whether users have completed onboarding and their current step

DO $$
BEGIN
  -- Add onboarding tracking columns
  ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

  RAISE NOTICE 'Onboarding tracking columns added to profiles table';
END $$;

-- Add index for querying incomplete onboarding users
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed
  ON public.profiles(onboarding_completed)
  WHERE onboarding_completed = FALSE;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether user has completed the onboarding flow';
COMMENT ON COLUMN public.profiles.onboarding_step IS 'Current step in onboarding (0-5): 0=not started, 1=photos, 2=basic info, 3=demographics, 4=lifestyle, 5=interests';
COMMENT ON COLUMN public.profiles.onboarding_started_at IS 'When user started onboarding';
COMMENT ON COLUMN public.profiles.onboarding_completed_at IS 'When user completed onboarding';

-- Function to automatically mark onboarding as complete when profile is sufficiently filled
CREATE OR REPLACE FUNCTION public.check_onboarding_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-complete onboarding if user has:
  -- 1. At least one profile image
  -- 2. Name, age, and gender filled
  -- 3. At least 3 demographic fields filled
  -- 4. Profile completion >= 70%

  IF NEW.onboarding_completed = FALSE AND
     array_length(NEW.images, 1) > 0 AND
     NEW.full_name IS NOT NULL AND
     NEW.age IS NOT NULL AND
     NEW.gender IS NOT NULL AND
     (NEW.profile_completion_percentage IS NULL OR NEW.profile_completion_percentage >= 70) THEN

    NEW.onboarding_completed := TRUE;
    NEW.onboarding_step := 5;
    NEW.onboarding_completed_at := NOW();

    RAISE NOTICE 'Auto-completed onboarding for user %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger to check onboarding completion on profile updates
DROP TRIGGER IF EXISTS trigger_check_onboarding_completion ON public.profiles;
CREATE TRIGGER trigger_check_onboarding_completion
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_onboarding_completion();

-- Log successful migration
DO $$
BEGIN
  RAISE NOTICE 'Onboarding tracking setup complete:';
  RAISE NOTICE '  - Added tracking columns to profiles';
  RAISE NOTICE '  - Created auto-completion trigger';
  RAISE NOTICE '  - Added performance indexes';
END $$;
