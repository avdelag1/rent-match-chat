-- Migration: Add service_offerings and intentions columns
-- Run this on Supabase SQL Editor

-- Add service_offerings column to owner_profiles
ALTER TABLE owner_profiles ADD COLUMN IF NOT EXISTS service_offerings text[] DEFAULT '{}'::text[];

-- Add intentions column to client_profiles  
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS intentions text[] DEFAULT '{}'::text[];

-- Create index for faster queries on the new columns
CREATE INDEX IF NOT EXISTS idx_owner_profiles_service_offerings ON owner_profiles USING GIN (service_offerings);
CREATE INDEX IF NOT EXISTS idx_client_profiles_intentions ON client_profiles USING GIN (intentions);

-- Enable RLS on new columns if tables have RLS enabled
-- (These will succeed silently if RLS is not enabled)

-- Comment on columns for documentation
COMMENT ON COLUMN owner_profiles.service_offerings IS 'Multi-option service offerings: property_rental, motorcycle_rental, bicycle_rental, professional_services';
COMMENT ON COLUMN client_profiles.intentions IS 'Multi-option intentions: rent_property, buy_property, rent_vehicle, hire_service';

-- Update existing rows to have empty arrays instead of null
UPDATE owner_profiles SET service_offerings = COALESCE(service_offerings, '{}'::text[]) WHERE service_offerings IS NULL;
UPDATE client_profiles SET intentions = COALESCE(intentions, '{}'::text[]) WHERE intentions IS NULL;
