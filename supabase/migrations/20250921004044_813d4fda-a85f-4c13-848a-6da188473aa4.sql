-- Create test conversation between users to test messaging
INSERT INTO conversations (client_id, owner_id, listing_id, status, match_id)
SELECT 
  (SELECT id FROM profiles WHERE role = 'client' LIMIT 1) as client_id,
  (SELECT id FROM profiles WHERE role = 'owner' LIMIT 1) as owner_id,
  (SELECT id FROM listings WHERE is_active = true LIMIT 1) as listing_id,
  'active' as status,
  gen_random_uuid() as match_id
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'client')
  AND EXISTS (SELECT 1 FROM profiles WHERE role = 'owner')
  AND EXISTS (SELECT 1 FROM listings WHERE is_active = true);