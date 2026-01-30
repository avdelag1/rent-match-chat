-- ============================================
-- COMPREHENSIVE SCHEMA AUDIT & FIX
-- Date: 2026-01-30
-- Purpose: Fix schema issues, add missing views, ensure RLS works
-- ============================================

-- ============================================
-- STEP 1: VERIFY & CREATE PROFILES VIEW
-- ============================================

-- Check if profiles_public view exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles_public'
  ) THEN
    -- Create unified profiles view for client browsing
    CREATE VIEW public.profiles_public AS
    SELECT 
      id,
      email,
      full_name,
      avatar_url,
      role,
      bio,
      phone,
      is_verified,
      is_premium,
      created_at,
      updated_at
    FROM public.profiles
    WHERE is_verified = true OR is_premium = true;
    
    COMMENT ON VIEW public.profiles_public IS 'Public profile view for verified/premium users';
  END IF;
END $$;

-- ============================================
-- STEP 2: ADD PROFILE COLUMNS FOR STRUCTURED DATA
-- ============================================

-- Client profile structured fields (multi-option, not free-text)
DO $$
BEGIN
  -- Gender (multi-select from predefined options)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
    ALTER TABLE public.profiles ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say'));
  END IF;
  
  -- Age
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age') THEN
    ALTER TABLE public.profiles ADD COLUMN age INTEGER CHECK (age >= 18 AND age <= 120);
  END IF;
  
  -- Profile images (multi-image upload)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_images') THEN
    ALTER TABLE public.profiles ADD COLUMN profile_images TEXT[] DEFAULT '{}';
  END IF;
  
  -- Client type (what they want to do)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'client_type') THEN
    ALTER TABLE public.profiles ADD COLUMN client_type TEXT[] DEFAULT '{}' CHECK (
      client_type <@ ARRAY['rent_property', 'buy_property', 'rent_vehicle', 'hire_service']
    );
  END IF;
  
  -- Lifestyle tags (multi-option)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'lifestyle_tags') THEN
    ALTER TABLE public.profiles ADD COLUMN lifestyle_tags TEXT[] DEFAULT '{}';
  END IF;
  
  -- Interests
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
    ALTER TABLE public.profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
  END IF;
  
  -- Has pets
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'has_pets') THEN
    ALTER TABLE public.profiles ADD COLUMN has_pets BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Occupation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'occupation') THEN
    ALTER TABLE public.profiles ADD COLUMN occupation TEXT;
  END IF;
  
  -- Nationality
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nationality') THEN
    ALTER TABLE public.profiles ADD COLUMN nationality TEXT;
  END IF;
  
  -- Languages spoken
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'languages') THEN
    ALTER TABLE public.profiles ADD COLUMN languages TEXT[] DEFAULT '{}';
  END IF;
  
  -- Smoking preference
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'smoking_preference') THEN
    ALTER TABLE public.profiles ADD COLUMN smoking_preference TEXT CHECK (smoking_preference IN ('non_smoker', 'smoker', 'any'));
  END IF;
  
  -- Party friendly
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'party_friendly') THEN
    ALTER TABLE public.profiles ADD COLUMN party_friendly BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Preferred activities
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_activities') THEN
    ALTER TABLE public.profiles ADD COLUMN preferred_activities TEXT[] DEFAULT '{}';
  END IF;
  
  -- Location preference (cities/areas they prefer)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location_preference') THEN
    ALTER TABLE public.profiles ADD COLUMN location_preference TEXT[] DEFAULT '{}';
  END IF;
  
  -- Budget range
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'budget_min') THEN
    ALTER TABLE public.profiles ADD COLUMN budget_min DECIMAL(12, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'budget_max') THEN
    ALTER TABLE public.profiles ADD COLUMN budget_max DECIMAL(12, 2);
  END IF;
  
  -- Move-in date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'move_in_date') THEN
    ALTER TABLE public.profiles ADD COLUMN move_in_date DATE;
  END IF;
  
  -- Employment status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'employment_status') THEN
    ALTER TABLE public.profiles ADD COLUMN employment_status TEXT CHECK (employment_status IN ('employed', 'self_employed', 'student', 'retired', 'unemployed'));
  END IF;
  
  -- Profile completion percentage (for UI progress bar)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_completion') THEN
    ALTER TABLE public.profiles ADD COLUMN profile_completion INTEGER DEFAULT 0 CHECK (profile_completion BETWEEN 0 AND 100);
  END IF;
  
  -- Active status for profile visibility
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
    ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- ============================================
-- STEP 3: UPDATE EXISTING NULL VALUES
-- ============================================

UPDATE public.profiles SET profile_images = '{}' WHERE profile_images IS NULL;
UPDATE public.profiles SET client_type = '{}' WHERE client_type IS NULL;
UPDATE public.profiles SET lifestyle_tags = '{}' WHERE lifestyle_tags IS NULL;
UPDATE public.profiles SET interests = '{}' WHERE interests IS NULL;
UPDATE public.profiles SET languages = '{}' WHERE languages IS NULL;
UPDATE public.profiles SET preferred_activities = '{}' WHERE preferred_activities IS NULL;
UPDATE public.profiles SET location_preference = '{}' WHERE location_preference IS NULL;

-- ============================================
-- STEP 4: ADD PROPER INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_client_type ON public.profiles USING GIN (client_type);

-- ============================================
-- STEP 5: UPDATE RLS POLICIES FOR NEW COLUMNS
-- ============================================

-- Profile visibility policy update (show to authenticated users if active)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Active profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT 
    USING (is_active = true OR auth.uid() = id);

-- ============================================
-- STEP 6: CLEANUP - REMOVE UNUSED LEGACY TABLES (SAFE)
-- ============================================

-- These tables are from early development and may not be in use
-- Uncomment if you're sure they're not needed:
/*
DROP TABLE IF EXISTS public.swipes;
DROP TABLE IF EXISTS public.saved_listings;
DROP TABLE IF EXISTS public.owner_profiles;
DROP TABLE IF EXISTS public.client_profiles;
*/

-- ============================================
-- STEP 7: VERIFICATION QUERIES
-- ============================================

-- Check profiles columns
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- ORDER BY ordinal_position;

-- Check likes table structure
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'likes' 
-- ORDER BY ordinal_position;

-- Check if profiles_public view exists
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles_public';
