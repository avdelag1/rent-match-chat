-- Migration: Fix storage bucket file size limits to match client validation
-- This fixes the issue where uploads were failing due to mismatch between
-- client-side validation (10MB) and server-side limits (5MB)

-- Update profile-images bucket to allow 10MB (matching client validation)
UPDATE storage.buckets
SET
  file_size_limit = 10485760, -- 10MB limit
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'profile-images';

-- Add file size limit and MIME types to profile-photos bucket (was missing)
UPDATE storage.buckets
SET
  file_size_limit = 10485760, -- 10MB limit
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'profile-photos';

-- Log successful migration
DO $$
BEGIN
  RAISE NOTICE 'Storage bucket limits updated:';
  RAISE NOTICE '  - profile-images: now 10MB (was 5MB)';
  RAISE NOTICE '  - profile-photos: now 10MB with MIME restrictions (was unlimited)';
  RAISE NOTICE 'This aligns with client-side validation limits';
END $$;
