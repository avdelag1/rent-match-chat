-- Add vehicle preferences to client_filter_preferences table
ALTER TABLE client_filter_preferences
ADD COLUMN IF NOT EXISTS interested_in_vehicles boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS vehicle_types text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS vehicle_body_types text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS vehicle_drive_types text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS vehicle_price_min numeric,
ADD COLUMN IF NOT EXISTS vehicle_price_max numeric,
ADD COLUMN IF NOT EXISTS vehicle_year_min integer,
ADD COLUMN IF NOT EXISTS vehicle_year_max integer,
ADD COLUMN IF NOT EXISTS vehicle_mileage_max integer,
ADD COLUMN IF NOT EXISTS vehicle_transmission text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS vehicle_fuel_types text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS vehicle_condition text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS vehicle_seating_capacity integer,
ADD COLUMN IF NOT EXISTS vehicle_number_of_doors integer,
ADD COLUMN IF NOT EXISTS vehicle_safety_features text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS vehicle_comfort_features text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS vehicle_tech_features text[] DEFAULT ARRAY[]::text[];

-- Create index for vehicle interest filtering
CREATE INDEX IF NOT EXISTS idx_client_filter_preferences_vehicles 
ON client_filter_preferences(user_id, interested_in_vehicles) 
WHERE interested_in_vehicles = true;