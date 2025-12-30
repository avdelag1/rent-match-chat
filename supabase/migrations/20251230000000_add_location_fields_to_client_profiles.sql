-- Add location fields to client_profiles table
-- This allows clients to specify their location (where they are looking for rentals)

-- Add country field
ALTER TABLE client_profiles
ADD COLUMN IF NOT EXISTS country TEXT;

-- Add city field
ALTER TABLE client_profiles
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add neighborhood field
ALTER TABLE client_profiles
ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- Add latitude field
ALTER TABLE client_profiles
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8);

-- Add longitude field
ALTER TABLE client_profiles
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

-- Create index on city for faster location-based queries
CREATE INDEX IF NOT EXISTS idx_client_profiles_city ON client_profiles(city);

-- Create index on country for faster filtering
CREATE INDEX IF NOT EXISTS idx_client_profiles_country ON client_profiles(country);

-- Add comment for documentation
COMMENT ON COLUMN client_profiles.country IS 'Country where the client is looking for rentals';
COMMENT ON COLUMN client_profiles.city IS 'City where the client is looking for rentals';
COMMENT ON COLUMN client_profiles.neighborhood IS 'Preferred neighborhood within the city';
COMMENT ON COLUMN client_profiles.latitude IS 'Latitude coordinate for location-based matching';
COMMENT ON COLUMN client_profiles.longitude IS 'Longitude coordinate for location-based matching';
