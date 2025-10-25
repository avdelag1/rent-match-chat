-- Migration: Add vehicle and property-specific filter fields
-- Supports detailed filtering for motorcycles, bicycles, yachts, and properties

-- Check if properties table exists, if not skip this migration
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties') THEN

    -- Add general property fields
    ALTER TABLE public.properties
      ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'property' CHECK (category IN ('property', 'motorcycle', 'bicycle', 'yacht')),
      ADD COLUMN IF NOT EXISTS listing_mode TEXT DEFAULT 'rent' CHECK (listing_mode IN ('rent', 'sale', 'both')),
      ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS video_tour_url TEXT,
      ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;

    -- Property-specific fields
    ALTER TABLE public.properties
      ADD COLUMN IF NOT EXISTS bedrooms TEXT,
      ADD COLUMN IF NOT EXISTS bathrooms TEXT,
      ADD COLUMN IF NOT EXISTS square_feet INTEGER,
      ADD COLUMN IF NOT EXISTS property_type TEXT,
      ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS furnished BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS parking_included BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS move_in_date DATE,
      ADD COLUMN IF NOT EXISTS lease_duration TEXT;

    -- Motorcycle-specific fields
    ALTER TABLE public.properties
      ADD COLUMN IF NOT EXISTS motorcycle_type TEXT,
      ADD COLUMN IF NOT EXISTS engine_size TEXT,
      ADD COLUMN IF NOT EXISTS motorcycle_year INTEGER,
      ADD COLUMN IF NOT EXISTS motorcycle_condition TEXT,
      ADD COLUMN IF NOT EXISTS motorcycle_features TEXT[] DEFAULT '{}';

    -- Bicycle-specific fields
    ALTER TABLE public.properties
      ADD COLUMN IF NOT EXISTS bicycle_type TEXT,
      ADD COLUMN IF NOT EXISTS frame_size TEXT,
      ADD COLUMN IF NOT EXISTS is_electric BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS bicycle_features TEXT[] DEFAULT '{}';

    -- Yacht-specific fields
    ALTER TABLE public.properties
      ADD COLUMN IF NOT EXISTS yacht_type TEXT,
      ADD COLUMN IF NOT EXISTS yacht_length_feet INTEGER,
      ADD COLUMN IF NOT EXISTS yacht_cabins INTEGER,
      ADD COLUMN IF NOT EXISTS yacht_year INTEGER,
      ADD COLUMN IF NOT EXISTS overnight_capable BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS yacht_features TEXT[] DEFAULT '{}';

    -- Location fields for map search
    ALTER TABLE public.properties
      ADD COLUMN IF NOT EXISTS city TEXT,
      ADD COLUMN IF NOT EXISTS country TEXT,
      ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
      ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS location_zone TEXT;

    -- Availability and calendar fields
    ALTER TABLE public.properties
      ADD COLUMN IF NOT EXISTS available_from DATE,
      ADD COLUMN IF NOT EXISTS available_until DATE,
      ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS availability_calendar JSONB DEFAULT '{}'::jsonb;

    -- Analytics fields
    ALTER TABLE public.properties
      ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS inquiry_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2) DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

    -- Create indexes for property filters
    CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
    CREATE INDEX IF NOT EXISTS idx_properties_mode ON public.properties(listing_mode);
    CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
    CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
    CREATE INDEX IF NOT EXISTS idx_properties_available ON public.properties(is_available) WHERE is_available = TRUE;
    CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON public.properties(bedrooms) WHERE category = 'property';
    CREATE INDEX IF NOT EXISTS idx_properties_rating ON public.properties(average_rating DESC);

    -- GIN indexes for array fields
    CREATE INDEX IF NOT EXISTS idx_properties_amenities ON public.properties USING GIN(amenities);
    CREATE INDEX IF NOT EXISTS idx_properties_images ON public.properties USING GIN(images);

    -- Location index for map-based search
    CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties USING gist (
      ll_to_earth(latitude::float8, longitude::float8)
    ) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

    RAISE NOTICE 'Properties table updated successfully with vehicle-specific fields';
  ELSE
    RAISE NOTICE 'Properties table does not exist, skipping migration';
  END IF;
END $$;

-- Create property_views table for analytics
CREATE TABLE IF NOT EXISTS public.property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_property_views_property ON public.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewer ON public.property_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_property_views_date ON public.property_views(viewed_at DESC);

-- Enable RLS
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property owners can view their property analytics"
  ON public.property_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can record property views"
  ON public.property_views
  FOR INSERT
  WITH CHECK (TRUE);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_property_views()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.properties
  SET view_count = view_count + 1
  WHERE id = NEW.property_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_property_views ON public.property_views;
CREATE TRIGGER trg_increment_property_views
  AFTER INSERT ON public.property_views
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_property_views();

COMMENT ON TABLE public.property_views IS 'Tracks property views for analytics';
COMMENT ON COLUMN public.properties.availability_calendar IS 'JSONB object storing blocked/available dates for calendar system';
