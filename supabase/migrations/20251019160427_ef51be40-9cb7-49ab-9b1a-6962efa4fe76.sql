-- Add missing allows_smoking column to owner_client_preferences table
ALTER TABLE owner_client_preferences 
ADD COLUMN IF NOT EXISTS allows_smoking boolean DEFAULT null;

-- Add comment
COMMENT ON COLUMN owner_client_preferences.allows_smoking IS 
'Whether owner allows tenants who smoke';