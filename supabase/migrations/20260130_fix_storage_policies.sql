-- Fix storage policies to allow authenticated users to upload listing images

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- Create a new policy that allows authenticated users to upload to the listing-images bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'listing-images');