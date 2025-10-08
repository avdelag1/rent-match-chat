-- Add category support to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'property' CHECK (category IN ('property', 'yacht', 'motorcycle', 'bicycle')),
ADD COLUMN IF NOT EXISTS mode text DEFAULT 'rent' CHECK (mode IN ('sale', 'rent', 'both'));

-- Yacht-specific fields
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS description_short text,
ADD COLUMN IF NOT EXISTS description_full text,
ADD COLUMN IF NOT EXISTS rental_rates jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS length_m numeric,
ADD COLUMN IF NOT EXISTS year integer,
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS model text,
ADD COLUMN IF NOT EXISTS hull_material text,
ADD COLUMN IF NOT EXISTS engines text,
ADD COLUMN IF NOT EXISTS fuel_type text,
ADD COLUMN IF NOT EXISTS berths integer,
ADD COLUMN IF NOT EXISTS max_passengers integer,
ADD COLUMN IF NOT EXISTS availability_calendar jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS condition text,
ADD COLUMN IF NOT EXISTS equipment jsonb DEFAULT '[]';

-- Motorcycle-specific fields
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS mileage numeric,
ADD COLUMN IF NOT EXISTS engine_cc integer,
ADD COLUMN IF NOT EXISTS transmission text,
ADD COLUMN IF NOT EXISTS color text,
ADD COLUMN IF NOT EXISTS license_required text,
ADD COLUMN IF NOT EXISTS vehicle_type text;

-- Bicycle-specific fields
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS frame_size text,
ADD COLUMN IF NOT EXISTS wheel_size numeric,
ADD COLUMN IF NOT EXISTS frame_material text,
ADD COLUMN IF NOT EXISTS brake_type text,
ADD COLUMN IF NOT EXISTS gear_type text,
ADD COLUMN IF NOT EXISTS electric_assist boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS battery_range numeric;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_mode ON listings(mode);
CREATE INDEX IF NOT EXISTS idx_listings_category_mode ON listings(category, mode);

-- Update RLS policies to support new categories (maintain existing policies)
COMMENT ON TABLE listings IS 'Updated to support properties, yachts, motorcycles, and bicycles';