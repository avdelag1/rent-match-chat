-- Migration: Add listing availability statuses (rented, sold, pending, suspended, maintenance)
-- Date: 2025-11-17

-- ============================================================================
-- PART 1: Update listings table status constraint to include new values
-- ============================================================================

-- Drop existing check constraint
ALTER TABLE public.listings
DROP CONSTRAINT IF EXISTS listings_status_check;

-- Add new check constraint with all status values
ALTER TABLE public.listings
ADD CONSTRAINT listings_status_check
CHECK (status IN ('draft', 'active', 'inactive', 'archived', 'rented', 'sold', 'pending', 'suspended', 'maintenance'));

-- ============================================================================
-- PART 2: Add availability_status field for easier toggling
-- ============================================================================

-- Add new column for explicit availability status
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available'
CHECK (availability_status IN ('available', 'rented', 'sold', 'pending'));

-- Create index for faster filtering by availability
CREATE INDEX IF NOT EXISTS idx_listings_availability_status
ON public.listings(availability_status);

-- ============================================================================
-- PART 3: Create function to toggle listing availability
-- ============================================================================

-- Function to quickly toggle listing availability
CREATE OR REPLACE FUNCTION public.toggle_listing_availability(
  p_listing_id UUID,
  p_new_availability TEXT
)
RETURNS void AS $$
BEGIN
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = p_listing_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You do not own this listing';
  END IF;

  -- Update availability status
  UPDATE public.listings
  SET
    availability_status = p_new_availability,
    status = CASE
      WHEN p_new_availability = 'available' THEN 'active'
      WHEN p_new_availability = 'rented' THEN 'rented'
      WHEN p_new_availability = 'sold' THEN 'sold'
      ELSE 'inactive'
    END,
    updated_at = NOW()
  WHERE id = p_listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.toggle_listing_availability TO authenticated;

-- ============================================================================
-- PART 4: Update existing listings to have availability_status
-- ============================================================================

-- Set availability_status based on current status
UPDATE public.listings
SET availability_status = CASE
  WHEN status IN ('active', 'draft') THEN 'available'
  WHEN status = 'rented' THEN 'rented'
  WHEN status = 'sold' THEN 'sold'
  ELSE 'available'
END
WHERE availability_status IS NULL;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON COLUMN public.listings.availability_status IS 'Quick toggle for listing availability: available, rented, sold, pending';
COMMENT ON FUNCTION public.toggle_listing_availability IS 'Allows owners to quickly toggle listing availability status';
