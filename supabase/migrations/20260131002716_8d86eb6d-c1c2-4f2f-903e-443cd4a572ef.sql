-- ==========================================================
-- ADD MISSING COLUMNS TO LISTINGS TABLE FOR ALL CATEGORIES
-- Enables: Motorcycles, Bicycles, Workers/Services listings
-- ==========================================================

-- Vehicle columns (motorcycles + general vehicles)
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS vehicle_brand TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS vehicle_condition TEXT DEFAULT 'good',
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS mileage INTEGER,
ADD COLUMN IF NOT EXISTS engine_cc INTEGER,
ADD COLUMN IF NOT EXISTS fuel_type TEXT,
ADD COLUMN IF NOT EXISTS transmission_type TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS motorcycle_type TEXT,
ADD COLUMN IF NOT EXISTS vehicle_type TEXT;

-- Motorcycle features
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS has_abs BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_traction_control BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_heated_grips BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_luggage_rack BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_helmet BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_gear BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS license_required TEXT;

-- Bicycle columns
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS bicycle_type TEXT,
ADD COLUMN IF NOT EXISTS frame_size TEXT,
ADD COLUMN IF NOT EXISTS frame_material TEXT,
ADD COLUMN IF NOT EXISTS number_of_gears INTEGER,
ADD COLUMN IF NOT EXISTS suspension_type TEXT,
ADD COLUMN IF NOT EXISTS brake_type TEXT,
ADD COLUMN IF NOT EXISTS wheel_size TEXT,
ADD COLUMN IF NOT EXISTS electric_assist BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS battery_range INTEGER,
ADD COLUMN IF NOT EXISTS includes_lock BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_lights BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_basket BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_pump BOOLEAN DEFAULT false;

-- Worker/Service columns
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS service_category TEXT,
ADD COLUMN IF NOT EXISTS service_type TEXT,
ADD COLUMN IF NOT EXISTS custom_service_name TEXT,
ADD COLUMN IF NOT EXISTS work_type TEXT,
ADD COLUMN IF NOT EXISTS schedule_type TEXT,
ADD COLUMN IF NOT EXISTS days_available TEXT[],
ADD COLUMN IF NOT EXISTS time_slots_available TEXT[],
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS worker_skills TEXT[],
ADD COLUMN IF NOT EXISTS certifications TEXT[],
ADD COLUMN IF NOT EXISTS tools_equipment TEXT[],
ADD COLUMN IF NOT EXISTS minimum_booking_hours INTEGER,
ADD COLUMN IF NOT EXISTS offers_emergency_service BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS background_check_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS insurance_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC;

-- Core listing columns needed by various forms
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'MXN',
ADD COLUMN IF NOT EXISTS rental_rates JSONB,
ADD COLUMN IF NOT EXISTS rental_duration_type TEXT,
ADD COLUMN IF NOT EXISTS pricing_unit TEXT DEFAULT 'month',
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Mexico',
ADD COLUMN IF NOT EXISTS location_type TEXT,
ADD COLUMN IF NOT EXISTS service_radius_km INTEGER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_listing_type ON public.listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON public.listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_service_category ON public.listings(service_category);
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_brand ON public.listings(vehicle_brand);
CREATE INDEX IF NOT EXISTS idx_listings_bicycle_type ON public.listings(bicycle_type);