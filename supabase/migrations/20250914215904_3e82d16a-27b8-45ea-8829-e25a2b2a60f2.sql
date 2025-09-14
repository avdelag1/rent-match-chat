-- Drop all problematic triggers temporarily
DROP TRIGGER IF EXISTS profile_update_trigger ON profiles;

-- Just update the owner to complete onboarding
UPDATE profiles 
SET onboarding_completed = true 
WHERE role = 'owner' 
  AND onboarding_completed = false;