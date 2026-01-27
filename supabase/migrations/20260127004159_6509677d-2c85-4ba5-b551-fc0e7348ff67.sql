
-- Fix profiles_public view to include all active profiles with roles
-- and mark existing users as onboarding completed

-- Step 1: Set all existing active users as onboarding_completed
UPDATE profiles
SET onboarding_completed = true
WHERE is_active = true AND onboarding_completed = false;

-- Step 2: Update the profiles_public view to include role information
-- and be more inclusive (just require is_active, not onboarding_completed)
DROP VIEW IF EXISTS profiles_public;

CREATE VIEW profiles_public WITH (security_invoker=on) AS
SELECT 
  p.id,
  p.full_name,
  p.age,
  p.bio,
  p.occupation,
  p.gender,
  p.interests,
  p.lifestyle_tags,
  p.preferred_activities,
  -- CRITICAL: Include images from profiles table
  p.images,
  p.avatar_url,
  p.verified,
  p.city,
  p.budget_min,
  p.budget_max,
  p.monthly_income,
  p.created_at,
  p.onboarding_completed,
  p.is_active,
  -- Include role from user_roles table
  ur.role
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
WHERE p.is_active = true;

-- Add comment
COMMENT ON VIEW profiles_public IS 'Public view of profiles with role information. Excludes inactive accounts.';
