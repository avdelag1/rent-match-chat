-- Check and disable all triggers on profiles table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'profiles' AND event_object_schema = 'public'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON profiles';
    END LOOP;
END $$;

-- Update owner to complete onboarding
UPDATE profiles 
SET onboarding_completed = true 
WHERE role = 'owner' 
  AND (onboarding_completed = false OR onboarding_completed IS NULL);