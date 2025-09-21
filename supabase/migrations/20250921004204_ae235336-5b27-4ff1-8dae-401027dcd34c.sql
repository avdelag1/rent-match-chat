-- Temporarily disable the problematic trigger
DROP TRIGGER IF EXISTS on_match_created ON matches;

-- Create a simple match without triggering the problematic function
INSERT INTO matches (client_id, owner_id, listing_id, is_mutual, status)
VALUES (
  (SELECT id FROM profiles WHERE role = 'client' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'owner' LIMIT 1),
  (SELECT id FROM listings WHERE is_active = true LIMIT 1),
  true,
  'accepted'
);

-- Create conversation using the match we just created
INSERT INTO conversations (client_id, owner_id, listing_id, status, match_id)
SELECT 
  m.client_id,
  m.owner_id,
  m.listing_id,
  'active',
  m.id
FROM matches m
WHERE m.is_mutual = true
ORDER BY m.created_at DESC
LIMIT 1;

-- Add a test message to the conversation
INSERT INTO conversation_messages (conversation_id, sender_id, message_text)
SELECT 
  c.id,
  c.client_id,
  'Hello! I''m interested in your property. Can we discuss more details?'
FROM conversations c
ORDER BY c.created_at DESC
LIMIT 1;