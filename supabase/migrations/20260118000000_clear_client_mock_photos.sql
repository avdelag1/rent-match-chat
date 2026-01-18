-- Clear mock/placeholder photos from client profiles
-- This ensures clients without real photos show the "Waiting for photos" placeholder

-- Clear profile_images for client profiles that have placeholder/mock data
-- We'll preserve images that users have actually uploaded (you can adjust the WHERE clause based on your mock data patterns)
UPDATE client_profiles
SET profile_images = '[]'::jsonb
WHERE
  profile_images IS NOT NULL
  AND (
    -- Clear if images contain common placeholder URLs (adjust based on your mock data)
    profile_images::text LIKE '%placeholder%'
    OR profile_images::text LIKE '%mock%'
    OR profile_images::text LIKE '%test%'
    OR profile_images::text LIKE '%example.com%'
    OR profile_images::text LIKE '%unsplash.com%' -- Remove if you use real Unsplash images
    -- Add more patterns if needed for your specific mock data
  );

-- Also clear images from the profiles table for clients
UPDATE profiles
SET
  images = '[]'::jsonb,
  avatar_url = NULL,
  profile_photo_url = NULL
WHERE
  id IN (
    SELECT user_id
    FROM user_roles
    WHERE role = 'client'
  )
  AND (
    images IS NOT NULL AND (
      images::text LIKE '%placeholder%'
      OR images::text LIKE '%mock%'
      OR images::text LIKE '%test%'
      OR images::text LIKE '%example.com%'
      OR images::text LIKE '%unsplash.com%'
    )
    OR avatar_url LIKE '%placeholder%'
    OR avatar_url LIKE '%mock%'
    OR avatar_url LIKE '%test%'
    OR avatar_url LIKE '%example.com%'
    OR avatar_url LIKE '%unsplash.com%'
    OR profile_photo_url LIKE '%placeholder%'
    OR profile_photo_url LIKE '%mock%'
    OR profile_photo_url LIKE '%test%'
    OR profile_photo_url LIKE '%example.com%'
    OR profile_photo_url LIKE '%unsplash.com%'
  );

-- Log the cleanup
DO $$
BEGIN
  RAISE NOTICE 'Cleared mock photos from client profiles. Clients without photos will now show the "Waiting for client to upload photos :)" placeholder.';
END $$;
