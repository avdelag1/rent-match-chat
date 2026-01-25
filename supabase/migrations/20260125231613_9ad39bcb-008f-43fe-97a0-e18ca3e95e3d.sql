-- Add unique constraint to owner_likes table for proper upsert behavior
-- This ensures one unique like record per owner-client-listing combination
-- Using partial indexes to handle NULL listing_id cases

-- For general profile likes (listing_id IS NULL)
CREATE UNIQUE INDEX owner_likes_profile_unique 
ON owner_likes (owner_id, client_id) 
WHERE listing_id IS NULL;

-- For specific listing likes (listing_id IS NOT NULL)
CREATE UNIQUE INDEX owner_likes_listing_unique 
ON owner_likes (owner_id, client_id, listing_id) 
WHERE listing_id IS NOT NULL;