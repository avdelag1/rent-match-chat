-- First create a match between a client and owner
INSERT INTO matches (client_id, owner_id, listing_id, is_mutual, status)
SELECT 
  (SELECT id FROM profiles WHERE role = 'client' LIMIT 1) as client_id,
  (SELECT id FROM profiles WHERE role = 'owner' LIMIT 1) as owner_id,
  (SELECT id FROM listings WHERE is_active = true LIMIT 1) as listing_id,
  true as is_mutual,
  'accepted' as status
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'client')
  AND EXISTS (SELECT 1 FROM profiles WHERE role = 'owner')
  AND EXISTS (SELECT 1 FROM listings WHERE is_active = true);

-- Then create a conversation using that match
INSERT INTO conversations (client_id, owner_id, listing_id, status, match_id)
SELECT 
  m.client_id,
  m.owner_id,
  m.listing_id,
  'active' as status,
  m.id as match_id
FROM matches m
WHERE m.is_mutual = true
LIMIT 1;