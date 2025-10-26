-- Migration: Add additional vehicle and property-specific fields to listings
-- Enhances listings table with detailed filter fields

-- Add additional listing fields (many already exist in core table, adding remaining ones)
DO $$
BEGIN
  -- Motorcycle-specific fields (if not already added)
  ALTER TABLE public.listings
    ADD COLUMN IF NOT EXISTS motorcycle_type TEXT,
    ADD COLUMN IF NOT EXISTS engine_size TEXT,
    ADD COLUMN IF NOT EXISTS motorcycle_year INTEGER,
    ADD COLUMN IF NOT EXISTS motorcycle_condition TEXT,
    ADD COLUMN IF NOT EXISTS motorcycle_features TEXT[] DEFAULT '{}';

  -- Bicycle-specific fields
  ALTER TABLE public.listings
    ADD COLUMN IF NOT EXISTS bicycle_type TEXT,
    ADD COLUMN IF NOT EXISTS frame_size TEXT,
    ADD COLUMN IF NOT EXISTS is_electric BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS bicycle_features TEXT[] DEFAULT '{}';

  -- Yacht-specific fields
  ALTER TABLE public.listings
    ADD COLUMN IF NOT EXISTS yacht_type TEXT,
    ADD COLUMN IF NOT EXISTS yacht_length_feet INTEGER,
    ADD COLUMN IF NOT EXISTS yacht_cabins INTEGER,
    ADD COLUMN IF NOT EXISTS yacht_year INTEGER,
    ADD COLUMN IF NOT EXISTS overnight_capable BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS yacht_features TEXT[] DEFAULT '{}';

  -- Additional property fields
  ALTER TABLE public.listings
    ADD COLUMN IF NOT EXISTS parking_included BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS move_in_date DATE,
    ADD COLUMN IF NOT EXISTS lease_duration TEXT;

  -- Availability and calendar fields
  ALTER TABLE public.listings
    ADD COLUMN IF NOT EXISTS available_from DATE,
    ADD COLUMN IF NOT EXISTS available_until DATE,
    ADD COLUMN IF NOT EXISTS availability_calendar JSONB DEFAULT '{}'::jsonb;

  -- Analytics fields (if not already added)
  ALTER TABLE public.listings
    ADD COLUMN IF NOT EXISTS inquiry_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2) DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

  -- Location zone for Tulum-specific areas
  ALTER TABLE public.listings
    ADD COLUMN IF NOT EXISTS location_zone TEXT;

  RAISE NOTICE 'Listings table updated successfully with vehicle-specific fields';
END $$;

-- Create indexes for new vehicle-specific filters
CREATE INDEX IF NOT EXISTS idx_listings_motorcycle_type ON public.listings(motorcycle_type) WHERE category = 'motorcycle';
CREATE INDEX IF NOT EXISTS idx_listings_bicycle_type ON public.listings(bicycle_type) WHERE category = 'bicycle';
CREATE INDEX IF NOT EXISTS idx_listings_yacht_type ON public.listings(yacht_type) WHERE category = 'yacht';

-- GIN indexes for new array fields
CREATE INDEX IF NOT EXISTS idx_listings_motorcycle_features ON public.listings USING GIN(motorcycle_features) WHERE category = 'motorcycle';
CREATE INDEX IF NOT EXISTS idx_listings_bicycle_features ON public.listings USING GIN(bicycle_features) WHERE category = 'bicycle';
CREATE INDEX IF NOT EXISTS idx_listings_yacht_features ON public.listings USING GIN(yacht_features) WHERE category = 'yacht';

-- Create listing_views table for analytics (similar to property_views)
CREATE TABLE IF NOT EXISTS public.listing_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_listing_views_listing ON public.listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_viewer ON public.listing_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_date ON public.listing_views(viewed_at DESC);

-- Enable RLS
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

-- Listing owners can view their listing analytics
CREATE POLICY "Listing owners can view their analytics"
  ON public.listing_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND owner_id = auth.uid()
    )
  );

-- Anyone can record listing views
CREATE POLICY "Anyone can record listing views"
  ON public.listing_views
  FOR INSERT
  WITH CHECK (TRUE);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_listing_views()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.listings
  SET view_count = view_count + 1
  WHERE id = NEW.listing_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_increment_listing_views ON public.listing_views;
CREATE TRIGGER trg_increment_listing_views
  AFTER INSERT ON public.listing_views
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_listing_views();

COMMENT ON TABLE public.listing_views IS 'Tracks listing views for analytics';
COMMENT ON COLUMN public.listings.availability_calendar IS 'JSONB object storing blocked/available dates for calendar system';
