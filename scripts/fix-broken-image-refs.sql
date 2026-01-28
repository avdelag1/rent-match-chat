-- Fix Broken Image References in Database
-- This script finds and cleans up broken image URLs in your database
-- Run this on Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- ============================================================
-- 1. Find profiles with broken image references
-- ============================================================

-- Find profiles with external/mock image URLs that don't exist in storage
SELECT
  id,
  full_name,
  avatar_url,
  profile_photo_url,
  account_type
FROM profiles
WHERE
  -- External URLs (not in Supabase storage)
  (avatar_url IS NOT NULL AND avatar_url NOT LIKE '%supabase.co/storage%')
  OR (profile_photo_url IS NOT NULL AND profile_photo_url NOT LIKE '%supabase.co/storage%')
  -- Mock/placeholder URLs
  OR avatar_url LIKE '%placeholder%'
  OR avatar_url LIKE '%mock%'
  OR avatar_url LIKE '%unsplash.com%'
  OR avatar_url LIKE '%example.com%'
  OR profile_photo_url LIKE '%placeholder%'
  OR profile_photo_url LIKE '%mock%'
  OR profile_photo_url LIKE '%unsplash.com%'
  OR profile_photo_url LIKE '%example.com%';

-- Count broken profile image references
SELECT
  COUNT(*) as broken_profile_images,
  SUM(CASE WHEN avatar_url IS NOT NULL AND avatar_url NOT LIKE '%supabase.co/storage%' THEN 1 ELSE 0 END) as external_avatar_urls,
  SUM(CASE WHEN profile_photo_url IS NOT NULL AND profile_photo_url NOT LIKE '%supabase.co/storage%' THEN 1 ELSE 0 END) as external_profile_urls
FROM profiles
WHERE
  (avatar_url IS NOT NULL AND avatar_url NOT LIKE '%supabase.co/storage%')
  OR (profile_photo_url IS NOT NULL AND profile_photo_url NOT LIKE '%supabase.co/storage%');

-- ============================================================
-- 2. Find listings with broken image references
-- ============================================================

-- Find listings with external image URLs
SELECT
  id,
  title,
  owner_id,
  images,
  category
FROM listings
WHERE
  images IS NOT NULL
  AND array_length(images, 1) > 0
  AND EXISTS (
    SELECT 1 FROM unnest(images) as img
    WHERE img NOT LIKE '%supabase.co/storage%'
  );

-- Count broken listing image references
SELECT
  COUNT(*) as listings_with_external_images,
  SUM(array_length(images, 1)) as total_external_image_urls
FROM listings
WHERE
  images IS NOT NULL
  AND array_length(images, 1) > 0
  AND EXISTS (
    SELECT 1 FROM unnest(images) as img
    WHERE img NOT LIKE '%supabase.co/storage%'
  );

-- ============================================================
-- 3. CLEANUP: Remove broken image references
-- ============================================================

-- CAUTION: These UPDATE statements will modify your database
-- Review the SELECT queries above first to see what will be affected

-- Option A: Clear ALL external/mock profile images (SAFEST)
-- Uncomment to run:
/*
UPDATE profiles
SET
  avatar_url = NULL,
  profile_photo_url = NULL
WHERE
  (avatar_url IS NOT NULL AND avatar_url NOT LIKE '%supabase.co/storage%')
  OR (profile_photo_url IS NOT NULL AND profile_photo_url NOT LIKE '%supabase.co/storage%')
  OR avatar_url LIKE '%placeholder%'
  OR avatar_url LIKE '%mock%'
  OR avatar_url LIKE '%unsplash.com%'
  OR avatar_url LIKE '%example.com%'
  OR profile_photo_url LIKE '%placeholder%'
  OR profile_photo_url LIKE '%mock%'
  OR profile_photo_url LIKE '%unsplash.com%'
  OR profile_photo_url LIKE '%example.com%';
*/

-- Option B: Clear external listing images
-- Uncomment to run:
/*
UPDATE listings
SET images = ARRAY(
  SELECT img FROM unnest(images) as img
  WHERE img LIKE '%supabase.co/storage%'
)
WHERE
  images IS NOT NULL
  AND array_length(images, 1) > 0
  AND EXISTS (
    SELECT 1 FROM unnest(images) as img
    WHERE img NOT LIKE '%supabase.co/storage%'
  );
*/

-- Option C: Clear message attachments with external URLs
-- Uncomment to run:
/*
UPDATE conversation_messages
SET
  attachment_url = NULL,
  has_attachment = FALSE
WHERE
  attachment_url IS NOT NULL
  AND attachment_url NOT LIKE '%supabase.co/storage%';
*/

-- ============================================================
-- 4. ANALYTICS: Storage usage insights
-- ============================================================

-- Count storage objects by bucket
SELECT
  bucket_id,
  COUNT(*) as file_count,
  pg_size_pretty(SUM(
    CASE
      WHEN metadata->>'size' IS NOT NULL
      THEN (metadata->>'size')::bigint
      ELSE 0
    END
  )) as total_size
FROM storage.objects
GROUP BY bucket_id
ORDER BY SUM(
  CASE
    WHEN metadata->>'size' IS NOT NULL
    THEN (metadata->>'size')::bigint
    ELSE 0
  END
) DESC;

-- Find largest files in storage
SELECT
  bucket_id,
  name,
  created_at,
  pg_size_pretty(
    CASE
      WHEN metadata->>'size' IS NOT NULL
      THEN (metadata->>'size')::bigint
      ELSE 0
    END
  ) as size,
  (metadata->>'size')::bigint as size_bytes
FROM storage.objects
WHERE metadata->>'size' IS NOT NULL
ORDER BY (metadata->>'size')::bigint DESC
LIMIT 50;

-- Find oldest files in storage (potential cleanup candidates)
SELECT
  bucket_id,
  name,
  created_at,
  age(now(), created_at) as file_age,
  pg_size_pretty(
    CASE
      WHEN metadata->>'size' IS NOT NULL
      THEN (metadata->>'size')::bigint
      ELSE 0
    END
  ) as size
FROM storage.objects
WHERE metadata->>'size' IS NOT NULL
ORDER BY created_at ASC
LIMIT 50;

-- ============================================================
-- 5. REPORTS: Summary statistics
-- ============================================================

-- Overall database image statistics
SELECT
  (SELECT COUNT(*) FROM profiles WHERE avatar_url IS NOT NULL OR profile_photo_url IS NOT NULL) as profiles_with_images,
  (SELECT COUNT(*) FROM listings WHERE images IS NOT NULL AND array_length(images, 1) > 0) as listings_with_images,
  (SELECT COUNT(*) FROM conversation_messages WHERE attachment_url IS NOT NULL) as messages_with_attachments,
  (SELECT COUNT(*) FROM storage.objects WHERE bucket_id = 'profile-images') as profile_images_in_storage,
  (SELECT COUNT(*) FROM storage.objects WHERE bucket_id = 'profile-photos') as profile_photos_in_storage,
  (SELECT COUNT(*) FROM storage.objects WHERE bucket_id = 'listing-images') as listing_images_in_storage,
  (SELECT COUNT(*) FROM storage.objects WHERE bucket_id = 'message-attachments') as message_attachments_in_storage;
