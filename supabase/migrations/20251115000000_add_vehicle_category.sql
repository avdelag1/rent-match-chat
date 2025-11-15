-- Migration: Add vehicle category for cars, trucks, SUVs, vans, etc.
-- This enables listing and filtering of general vehicles beyond motorcycles

-- ============================================================================
-- VEHICLE-SPECIFIC ATTRIBUTES (Cars, Trucks, SUVs, Vans, etc.)
-- ============================================================================

ALTER TABLE public.listings
  -- Vehicle Type Classification
  ADD COLUMN IF NOT EXISTS vehicle_type TEXT, -- car, truck, suv, van, pickup, minivan, coupe, sedan, hatchback, wagon, convertible

  -- Body and Capacity
  ADD COLUMN IF NOT EXISTS body_type TEXT, -- sedan, coupe, hatchback, wagon, pickup, cargo, passenger
  ADD COLUMN IF NOT EXISTS number_of_doors INTEGER, -- 2, 3, 4, 5
  ADD COLUMN IF NOT EXISTS seating_capacity INTEGER, -- 2-15+ passengers
  ADD COLUMN IF NOT EXISTS cargo_capacity TEXT, -- for trucks/vans: in cubic feet or liters

  -- Drivetrain
  ADD COLUMN IF NOT EXISTS drive_type TEXT, -- FWD, RWD, AWD, 4WD

  -- Engine Details (reusing existing fields where possible)
  -- engine_size already exists (can be used for displacement in cc or liters)
  -- fuel_type already exists (gasoline, diesel, electric, hybrid, plug-in hybrid)
  -- transmission_type already exists (manual, automatic, CVT, semi-automatic)

  -- Additional Vehicle Specs
  ADD COLUMN IF NOT EXISTS engine_cylinders INTEGER, -- 3, 4, 6, 8, 10, 12
  ADD COLUMN IF NOT EXISTS horsepower INTEGER,
  ADD COLUMN IF NOT EXISTS torque INTEGER, -- in Nm
  ADD COLUMN IF NOT EXISTS fuel_economy_city DECIMAL(4,1), -- mpg or L/100km
  ADD COLUMN IF NOT EXISTS fuel_economy_highway DECIMAL(4,1),
  ADD COLUMN IF NOT EXISTS fuel_tank_capacity INTEGER, -- in liters
  ADD COLUMN IF NOT EXISTS towing_capacity INTEGER, -- in kg/lbs

  -- Electric Vehicle Specific
  ADD COLUMN IF NOT EXISTS battery_capacity DECIMAL(5,1), -- in kWh for EVs
  ADD COLUMN IF NOT EXISTS electric_range INTEGER, -- in km/miles
  ADD COLUMN IF NOT EXISTS charging_time TEXT, -- e.g., "8 hours (Level 2)", "30 min (DC fast)"

  -- Safety & Technology Features
  ADD COLUMN IF NOT EXISTS has_backup_camera BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_blind_spot_monitoring BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_lane_assist BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_adaptive_cruise_control BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_parking_sensors BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_keyless_entry BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_remote_start BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_sunroof BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_leather_seats BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_heated_seats BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_ventilated_seats BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_navigation BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_bluetooth BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_apple_carplay BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_android_auto BOOLEAN DEFAULT FALSE,

  -- Audio & Entertainment
  ADD COLUMN IF NOT EXISTS audio_system TEXT, -- standard, premium, branded (e.g., Bose, Harman Kardon)
  ADD COLUMN IF NOT EXISTS number_of_speakers INTEGER,

  -- Interior Features
  ADD COLUMN IF NOT EXISTS interior_color TEXT,
  ADD COLUMN IF NOT EXISTS upholstery_material TEXT, -- cloth, leather, synthetic leather, alcantara

  -- Exterior Features
  ADD COLUMN IF NOT EXISTS exterior_color TEXT, -- can be different from vehicle_color
  ADD COLUMN IF NOT EXISTS wheel_size TEXT, -- e.g., "17 inch", "18 inch alloy"

  -- Condition & History
  ADD COLUMN IF NOT EXISTS accident_history TEXT, -- none, minor, major, unknown
  ADD COLUMN IF NOT EXISTS number_of_owners INTEGER,
  ADD COLUMN IF NOT EXISTS service_history BOOLEAN DEFAULT FALSE, -- full service history available
  ADD COLUMN IF NOT EXISTS warranty_remaining TEXT, -- e.g., "2 years/40,000 km"
  ADD COLUMN IF NOT EXISTS registration_status TEXT, -- registered, unregistered, salvage, rebuilt

  -- Commercial Vehicle Specific
  ADD COLUMN IF NOT EXISTS payload_capacity INTEGER, -- in kg for trucks/vans
  ADD COLUMN IF NOT EXISTS bed_length TEXT, -- for pickup trucks: short, standard, long
  ADD COLUMN IF NOT EXISTS has_tow_package BOOLEAN DEFAULT FALSE,

  -- Additional Features (array for flexibility)
  ADD COLUMN IF NOT EXISTS vehicle_features TEXT[] DEFAULT '{}'; -- additional features not covered above

-- ============================================================================
-- INDEXES FOR VEHICLE FILTERING
-- ============================================================================

-- Primary vehicle filters
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_type ON public.listings(vehicle_type) WHERE category = 'vehicle';
CREATE INDEX IF NOT EXISTS idx_listings_body_type ON public.listings(body_type) WHERE category = 'vehicle';
CREATE INDEX IF NOT EXISTS idx_listings_drive_type ON public.listings(drive_type) WHERE category = 'vehicle';
CREATE INDEX IF NOT EXISTS idx_listings_seating_capacity ON public.listings(seating_capacity) WHERE category = 'vehicle';
CREATE INDEX IF NOT EXISTS idx_listings_fuel_type_vehicle ON public.listings(fuel_type) WHERE category = 'vehicle';

-- Vehicle condition and features
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_condition ON public.listings(vehicle_condition) WHERE category = 'vehicle';
CREATE INDEX IF NOT EXISTS idx_listings_number_of_doors ON public.listings(number_of_doors) WHERE category = 'vehicle';

-- Array index for vehicle features
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_features ON public.listings USING GIN(vehicle_features) WHERE category = 'vehicle';

-- ============================================================================
-- CONSTRAINTS AND VALIDATION
-- ============================================================================

-- Ensure reasonable values
ALTER TABLE public.listings
  ADD CONSTRAINT check_number_of_doors_valid CHECK (number_of_doors IS NULL OR (number_of_doors >= 2 AND number_of_doors <= 6)),
  ADD CONSTRAINT check_seating_capacity_valid CHECK (seating_capacity IS NULL OR (seating_capacity >= 1 AND seating_capacity <= 20)),
  ADD CONSTRAINT check_engine_cylinders_valid CHECK (engine_cylinders IS NULL OR (engine_cylinders >= 1 AND engine_cylinders <= 16)),
  ADD CONSTRAINT check_horsepower_positive CHECK (horsepower IS NULL OR horsepower > 0),
  ADD CONSTRAINT check_number_of_owners_valid CHECK (number_of_owners IS NULL OR (number_of_owners >= 0 AND number_of_owners <= 20));

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.listings.vehicle_type IS 'Type: car, truck, suv, van, pickup, minivan, coupe, sedan, hatchback, wagon, convertible';
COMMENT ON COLUMN public.listings.body_type IS 'Body style: sedan, coupe, hatchback, wagon, pickup, cargo, passenger van';
COMMENT ON COLUMN public.listings.drive_type IS 'Drivetrain: FWD, RWD, AWD, 4WD';
COMMENT ON COLUMN public.listings.fuel_economy_city IS 'Fuel economy in city (mpg or L/100km)';
COMMENT ON COLUMN public.listings.fuel_economy_highway IS 'Fuel economy on highway (mpg or L/100km)';
COMMENT ON COLUMN public.listings.battery_capacity IS 'Battery capacity in kWh for electric vehicles';
COMMENT ON COLUMN public.listings.electric_range IS 'Driving range in km/miles for electric/hybrid vehicles';
COMMENT ON COLUMN public.listings.accident_history IS 'Accident history: none, minor, major, unknown';
COMMENT ON COLUMN public.listings.payload_capacity IS 'Payload capacity in kg for trucks and commercial vehicles';
COMMENT ON COLUMN public.listings.towing_capacity IS 'Towing capacity in kg/lbs';
COMMENT ON COLUMN public.listings.vehicle_features IS 'Array of additional vehicle features';

-- Add comment indicating successful migration
COMMENT ON TABLE public.listings IS 'Listings table supporting property, yacht, motorcycle, bicycle, and vehicle categories';
