-- Add comprehensive attributes for all listing categories
-- This enables owners to describe their listings in detail and clients to filter precisely

-- ============================================================================
-- PROPERTY-SPECIFIC ATTRIBUTES
-- ============================================================================

ALTER TABLE public.listings
  -- Size and Layout
  ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
  ADD COLUMN IF NOT EXISTS bathrooms DECIMAL(3,1), -- e.g., 2.5 for 2 full + 1 half bath
  ADD COLUMN IF NOT EXISTS square_feet INTEGER,
  ADD COLUMN IF NOT EXISTS floor_number INTEGER,
  ADD COLUMN IF NOT EXISTS total_floors INTEGER,

  -- Features
  ADD COLUMN IF NOT EXISTS is_furnished BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_balcony BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_parking BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS parking_spots INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_pet_friendly BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_elevator BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_security BOOLEAN DEFAULT FALSE,

  -- Amenities (JSONB for flexibility)
  ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}',

  -- Utilities
  ADD COLUMN IF NOT EXISTS utilities_included TEXT[] DEFAULT '{}', -- ['water', 'electricity', 'internet', 'gas']

  -- Property Type Details
  ADD COLUMN IF NOT EXISTS property_subtype TEXT, -- apartment, house, studio, condo, villa
  ADD COLUMN IF NOT EXISTS year_built INTEGER,
  ADD COLUMN IF NOT EXISTS last_renovated INTEGER,

  -- Views and Orientation
  ADD COLUMN IF NOT EXISTS view_type TEXT, -- ocean, city, garden, mountain
  ADD COLUMN IF NOT EXISTS orientation TEXT; -- north, south, east, west

-- ============================================================================
-- MOTORCYCLE-SPECIFIC ATTRIBUTES
-- ============================================================================

ALTER TABLE public.listings
  -- Basic Info
  ADD COLUMN IF NOT EXISTS vehicle_brand TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_year INTEGER,
  ADD COLUMN IF NOT EXISTS vehicle_color TEXT,

  -- Motorcycle Specific
  ADD COLUMN IF NOT EXISTS engine_size INTEGER, -- in cc
  ADD COLUMN IF NOT EXISTS motorcycle_type TEXT, -- sport, cruiser, touring, adventure, naked, scooter
  ADD COLUMN IF NOT EXISTS transmission_type TEXT, -- manual, automatic
  ADD COLUMN IF NOT EXISTS mileage INTEGER, -- in kilometers
  ADD COLUMN IF NOT EXISTS fuel_type TEXT, -- gasoline, electric, hybrid
  ADD COLUMN IF NOT EXISTS vehicle_condition TEXT, -- new, like_new, excellent, good, fair

  -- Features
  ADD COLUMN IF NOT EXISTS has_abs BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_traction_control BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_heated_grips BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_luggage_rack BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS includes_helmet BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS includes_gear BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- BICYCLE-SPECIFIC ATTRIBUTES
-- ============================================================================

ALTER TABLE public.listings
  -- Bicycle Type
  ADD COLUMN IF NOT EXISTS bicycle_type TEXT, -- road, mountain, hybrid, electric, cruiser, folding, bmx
  ADD COLUMN IF NOT EXISTS frame_size TEXT, -- XS, S, M, L, XL or in cm
  ADD COLUMN IF NOT EXISTS frame_material TEXT, -- carbon, aluminum, steel, titanium

  -- Specifications
  ADD COLUMN IF NOT EXISTS number_of_gears INTEGER,
  ADD COLUMN IF NOT EXISTS is_electric_bike BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS battery_range INTEGER, -- in km, for electric bikes
  ADD COLUMN IF NOT EXISTS suspension_type TEXT, -- front, full, rigid
  ADD COLUMN IF NOT EXISTS brake_type TEXT, -- disc, rim, hydraulic
  ADD COLUMN IF NOT EXISTS wheel_size TEXT, -- 26", 27.5", 29", 700c

  -- Accessories
  ADD COLUMN IF NOT EXISTS includes_lock BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS includes_lights BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS includes_basket BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS includes_pump BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- YACHT-SPECIFIC ATTRIBUTES
-- ============================================================================

ALTER TABLE public.listings
  -- Yacht Specs
  ADD COLUMN IF NOT EXISTS yacht_type TEXT, -- motor, sail, catamaran, trimaran
  ADD COLUMN IF NOT EXISTS yacht_length DECIMAL(5,2), -- in meters
  ADD COLUMN IF NOT EXISTS number_of_cabins INTEGER,
  ADD COLUMN IF NOT EXISTS number_of_berths INTEGER,
  ADD COLUMN IF NOT EXISTS number_of_heads INTEGER, -- bathrooms
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER, -- max people

  -- Engine and Performance
  ADD COLUMN IF NOT EXISTS engine_hours INTEGER,
  ADD COLUMN IF NOT EXISTS fuel_capacity INTEGER, -- in liters
  ADD COLUMN IF NOT EXISTS water_capacity INTEGER, -- in liters
  ADD COLUMN IF NOT EXISTS max_speed INTEGER, -- in knots
  ADD COLUMN IF NOT EXISTS cruising_speed INTEGER, -- in knots

  -- Features
  ADD COLUMN IF NOT EXISTS has_air_conditioning BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_generator BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_autopilot BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_gps BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_radar BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS includes_crew BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS includes_captain BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS includes_water_toys BOOLEAN DEFAULT FALSE, -- jet ski, kayak, etc.

  -- Additional
  ADD COLUMN IF NOT EXISTS yacht_brand TEXT,
  ADD COLUMN IF NOT EXISTS hull_material TEXT; -- fiberglass, wood, aluminum, steel

-- ============================================================================
-- COMMON ATTRIBUTES (All Categories)
-- ============================================================================

ALTER TABLE public.listings
  -- Location Details
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS proximity_to_beach TEXT, -- walking_distance, short_drive, etc.
  ADD COLUMN IF NOT EXISTS proximity_to_downtown TEXT,

  -- Rental Terms
  ADD COLUMN IF NOT EXISTS minimum_rental_period TEXT, -- daily, weekly, monthly
  ADD COLUMN IF NOT EXISTS maximum_rental_period TEXT,
  ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS requires_insurance BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cancellation_policy TEXT, -- flexible, moderate, strict

  -- Additional Details
  ADD COLUMN IF NOT EXISTS special_features TEXT[], -- any unique selling points
  ADD COLUMN IF NOT EXISTS restrictions TEXT[], -- no smoking, no parties, etc.
  ADD COLUMN IF NOT EXISTS availability_calendar JSONB; -- for future booking system

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Property indexes
CREATE INDEX IF NOT EXISTS idx_listings_bedrooms ON public.listings(bedrooms) WHERE category = 'property';
CREATE INDEX IF NOT EXISTS idx_listings_bathrooms ON public.listings(bathrooms) WHERE category = 'property';
CREATE INDEX IF NOT EXISTS idx_listings_is_furnished ON public.listings(is_furnished) WHERE category = 'property';
CREATE INDEX IF NOT EXISTS idx_listings_is_pet_friendly ON public.listings(is_pet_friendly) WHERE category = 'property';

-- Motorcycle indexes
CREATE INDEX IF NOT EXISTS idx_listings_motorcycle_type ON public.listings(motorcycle_type) WHERE category = 'motorcycle';
CREATE INDEX IF NOT EXISTS idx_listings_engine_size ON public.listings(engine_size) WHERE category = 'motorcycle';
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_year ON public.listings(vehicle_year) WHERE category IN ('motorcycle', 'bicycle', 'yacht');

-- Bicycle indexes
CREATE INDEX IF NOT EXISTS idx_listings_bicycle_type ON public.listings(bicycle_type) WHERE category = 'bicycle';
CREATE INDEX IF NOT EXISTS idx_listings_is_electric_bike ON public.listings(is_electric_bike) WHERE category = 'bicycle';

-- Yacht indexes
CREATE INDEX IF NOT EXISTS idx_listings_yacht_type ON public.listings(yacht_type) WHERE category = 'yacht';
CREATE INDEX IF NOT EXISTS idx_listings_yacht_length ON public.listings(yacht_length) WHERE category = 'yacht';
CREATE INDEX IF NOT EXISTS idx_listings_number_of_cabins ON public.listings(number_of_cabins) WHERE category = 'yacht';

-- Common indexes
CREATE INDEX IF NOT EXISTS idx_listings_neighborhood ON public.listings(neighborhood);
CREATE INDEX IF NOT EXISTS idx_listings_minimum_rental_period ON public.listings(minimum_rental_period);

-- ============================================================================
-- CONSTRAINTS AND CHECKS
-- ============================================================================

-- Ensure logical values
ALTER TABLE public.listings
  ADD CONSTRAINT check_bedrooms_positive CHECK (bedrooms IS NULL OR bedrooms >= 0),
  ADD CONSTRAINT check_bathrooms_positive CHECK (bathrooms IS NULL OR bathrooms >= 0),
  ADD CONSTRAINT check_square_feet_positive CHECK (square_feet IS NULL OR square_feet > 0),
  ADD CONSTRAINT check_engine_size_positive CHECK (engine_size IS NULL OR engine_size > 0),
  ADD CONSTRAINT check_yacht_length_positive CHECK (yacht_length IS NULL OR yacht_length > 0),
  ADD CONSTRAINT check_vehicle_year_reasonable CHECK (vehicle_year IS NULL OR (vehicle_year >= 1900 AND vehicle_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 2));

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.listings.bedrooms IS 'Number of bedrooms (Property category)';
COMMENT ON COLUMN public.listings.bathrooms IS 'Number of bathrooms, supports .5 for half bath (Property category)';
COMMENT ON COLUMN public.listings.amenities IS 'Array of amenities like pool, gym, wifi, etc.';
COMMENT ON COLUMN public.listings.motorcycle_type IS 'Type: sport, cruiser, touring, adventure, naked, scooter';
COMMENT ON COLUMN public.listings.bicycle_type IS 'Type: road, mountain, hybrid, electric, cruiser, folding, bmx';
COMMENT ON COLUMN public.listings.yacht_type IS 'Type: motor, sail, catamaran, trimaran';
COMMENT ON COLUMN public.listings.number_of_berths IS 'Sleeping capacity on yacht';
COMMENT ON COLUMN public.listings.number_of_heads IS 'Number of bathrooms on yacht';
