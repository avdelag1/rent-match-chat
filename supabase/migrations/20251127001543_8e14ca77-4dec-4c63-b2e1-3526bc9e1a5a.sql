-- Add updated_at columns to track when listings/profiles are modified
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE client_profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to listings table
DROP TRIGGER IF EXISTS update_listings_modtime ON listings;
CREATE TRIGGER update_listings_modtime
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Add trigger to client_profiles table
DROP TRIGGER IF EXISTS update_client_profiles_modtime ON client_profiles;
CREATE TRIGGER update_client_profiles_modtime
    BEFORE UPDATE ON client_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Create index on updated_at for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_updated_at ON listings(updated_at);
CREATE INDEX IF NOT EXISTS idx_client_profiles_updated_at ON client_profiles(updated_at);