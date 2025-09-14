-- Create the missing owner profile
INSERT INTO profiles (
  id, 
  role, 
  full_name, 
  email, 
  onboarding_completed, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  '20e72ef9-e6bb-4bea-b9ed-cc3000af147b',
  'owner',
  'Juan',
  'owner1@owner.com',
  true,
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET 
  onboarding_completed = true,
  is_active = true,
  updated_at = now();