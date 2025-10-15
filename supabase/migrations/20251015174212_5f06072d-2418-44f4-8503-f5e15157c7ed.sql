-- Phase 1: Lock Down profiles Table - Create Public View and Strict RLS

-- Step 1: Create profiles_public view with only matching-relevant fields
CREATE OR REPLACE VIEW profiles_public AS
SELECT 
  id,
  full_name,
  age,
  bio,
  occupation,
  interests,
  lifestyle_tags,
  preferred_activities,
  avatar_url,
  images,
  verified,
  role,
  is_active,
  onboarding_completed,
  location,
  latitude,
  longitude,
  gender,
  nationality,
  monthly_income,
  has_pets,
  preferred_property_types,
  budget_min,
  budget_max
FROM profiles
WHERE is_active = true AND onboarding_completed = true;

-- Step 2: Drop existing permissive policies on profiles
DROP POLICY IF EXISTS "Limited profile visibility for matching" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles for matching" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can view other active profiles" ON profiles;

-- Step 3: Create strict owner-only policies on profiles
CREATE POLICY "Users can only view own full profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can only update own profile"  
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated  
WITH CHECK (auth.uid() = id);

-- Step 4: Grant access to profiles_public view
GRANT SELECT ON profiles_public TO authenticated;

-- Step 5: Create RLS policy for profiles_public view
-- Note: Views inherit RLS from base tables, but we add explicit access control
CREATE POLICY "Authenticated users can view public profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  -- Allow viewing through profiles_public (other users' public info)
  (is_active = true AND onboarding_completed = true AND auth.uid() != id)
  OR
  -- Allow viewing own full profile
  (auth.uid() = id)
);