-- ==========================================================
-- Fix listings table: NOT NULL violations, CHECK mismatches,
-- and type mismatch that block every listing INSERT.
-- ==========================================================

-- 1. state is NOT NULL but no form collects it.
--    The column was defined NOT NULL in initial_schema and the later
--    ADD COLUMN IF NOT EXISTS was a no-op (column already existed).
ALTER TABLE public.listings ALTER COLUMN state DROP NOT NULL;

-- 2. price is NOT NULL but motorcycle/bicycle forms use rental_rates
--    instead of a flat price.  Make it nullable so those categories
--    can save.
ALTER TABLE public.listings ALTER COLUMN price DROP NOT NULL;

-- 3. property_type CHECK only allowed a small lowercase set but the
--    form sends mixed-case values including types not in the original
--    set (Villa, Condo, Loft, Penthouse, Townhouse, Other).
--    Use LOWER() comparison so any casing works.
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_property_type_check;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_property_type_check
  CHECK (property_type IS NULL OR LOWER(property_type) IN (
    'apartment', 'house', 'room', 'studio', 'commercial', 'land',
    'villa', 'condo', 'loft', 'penthouse', 'townhouse', 'other'
  ));

-- 4. vehicle_condition CHECK used a lowercase set but the form sends
--    title-case values, and 'Needs Work' was not in the set at all.
--    Use LOWER() and add 'needs work'.
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_vehicle_condition_check;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_vehicle_condition_check
  CHECK (vehicle_condition IS NULL OR LOWER(vehicle_condition) IN (
    'new', 'excellent', 'good', 'fair', 'poor', 'needs work'
  ));

-- 5. wheel_size was DECIMAL(5,2) in initial_schema but the form sends
--    strings like '27.5"' and '700c'.  The later ADD COLUMN IF NOT EXISTS
--    with TEXT was a no-op because the column already existed.
--    Convert to TEXT now.
ALTER TABLE public.listings ALTER COLUMN wheel_size TYPE TEXT
  USING CASE
    WHEN wheel_size IS NOT NULL THEN wheel_size::TEXT
    ELSE NULL
  END;
