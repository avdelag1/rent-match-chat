-- Add category and mode columns for multi-category listings
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'property',
ADD COLUMN IF NOT EXISTS mode text DEFAULT 'rent';

-- Common vehicle fields
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS vehicle_brand text,
ADD COLUMN IF NOT EXISTS vehicle_model text,
ADD COLUMN IF NOT EXISTS vehicle_condition text;

-- Motorcycle-specific fields
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS motorcycle_type text,
ADD COLUMN IF NOT EXISTS transmission_type text,
ADD COLUMN IF NOT EXISTS has_abs boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_traction_control boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_heated_grips boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_luggage_rack boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_helmet boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_gear boolean DEFAULT false;

-- Bicycle-specific fields
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS bicycle_type text,
ADD COLUMN IF NOT EXISTS frame_size text,
ADD COLUMN IF NOT EXISTS frame_material text,
ADD COLUMN IF NOT EXISTS number_of_gears integer,
ADD COLUMN IF NOT EXISTS suspension_type text,
ADD COLUMN IF NOT EXISTS brake_type text,
ADD COLUMN IF NOT EXISTS includes_lock boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_lights boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_basket boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_pump boolean DEFAULT false;

-- Yacht-specific fields
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS yacht_type text,
ADD COLUMN IF NOT EXISTS hull_material text,
ADD COLUMN IF NOT EXISTS engines text,
ADD COLUMN IF NOT EXISTS fuel_type text,
ADD COLUMN IF NOT EXISTS crew_option text,
ADD COLUMN IF NOT EXISTS engine_type text;

-- Location fields
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS neighborhood text;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_mode ON listings(mode);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);