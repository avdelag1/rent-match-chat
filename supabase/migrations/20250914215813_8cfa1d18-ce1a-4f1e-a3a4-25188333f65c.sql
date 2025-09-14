-- Update owner profiles to mark onboarding as completed for testing
UPDATE profiles 
SET onboarding_completed = true 
WHERE role = 'owner' 
  AND (onboarding_completed = false OR onboarding_completed IS NULL);