-- Create trigger function to automatically sync age from client_profiles to profiles
CREATE OR REPLACE FUNCTION sync_client_age_to_profiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profiles table with the new age whenever client_profiles.age changes
  UPDATE profiles 
  SET age = NEW.age
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on client_profiles to fire after INSERT or UPDATE of age column
DROP TRIGGER IF EXISTS trigger_sync_client_age ON client_profiles;
CREATE TRIGGER trigger_sync_client_age
  AFTER INSERT OR UPDATE OF age
  ON client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_client_age_to_profiles();

-- Backfill: Sync all existing ages from client_profiles to profiles
-- This fixes any current mismatches where profiles.age is outdated
UPDATE profiles p
SET age = cp.age
FROM client_profiles cp
WHERE p.id = cp.user_id
  AND cp.age IS NOT NULL
  AND (p.age IS NULL OR p.age != cp.age);