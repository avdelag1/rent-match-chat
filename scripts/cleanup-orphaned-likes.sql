-- Clean up orphaned likes (swipes that point to deleted profiles/listings)
-- Run this in Supabase SQL Editor

-- Delete swipes where the target listing doesn't exist
DELETE FROM public.swipes
WHERE category = 'property'
  AND target_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = swipes.target_id
  );

-- Delete swipes where the target profile doesn't exist
DELETE FROM public.swipes
WHERE category IN ('vehicle', 'worker', 'services')
  AND target_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.client_profiles
    WHERE client_profiles.user_id::text = swipes.target_id
  );

-- Delete swipes where the swiper profile doesn't exist
DELETE FROM public.swipes
WHERE user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = swipes.user_id
  );

-- Verify cleanup (should return 0 for all)
SELECT
  'Orphaned listing swipes' as type,
  COUNT(*) as count
FROM public.swipes
WHERE category = 'property'
  AND target_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = swipes.target_id
  )
UNION ALL
SELECT
  'Orphaned profile swipes' as type,
  COUNT(*) as count
FROM public.swipes
WHERE category IN ('vehicle', 'worker', 'services')
  AND target_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.client_profiles
    WHERE client_profiles.user_id::text = swipes.target_id
  )
UNION ALL
SELECT
  'Orphaned user swipes' as type,
  COUNT(*) as count
FROM public.swipes
WHERE user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = swipes.user_id
  );
