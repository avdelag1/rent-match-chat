-- Ensure profile-images bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'profile-images';