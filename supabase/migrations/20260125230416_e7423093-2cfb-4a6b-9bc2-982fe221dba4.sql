-- Fix owner_likes: Remove duplicates and prevent self-likes

-- Step 1: Delete duplicate rows, keeping only the most recent one
DELETE FROM owner_likes a
USING owner_likes b
WHERE a.id < b.id 
  AND a.owner_id = b.owner_id 
  AND a.client_id = b.client_id
  AND ((a.listing_id IS NULL AND b.listing_id IS NULL) OR a.listing_id = b.listing_id);

-- Step 2: Delete self-likes (owner liking themselves)
DELETE FROM owner_likes
WHERE owner_id = client_id;

-- Step 3: Drop the existing unique constraint
ALTER TABLE owner_likes DROP CONSTRAINT IF EXISTS owner_likes_owner_id_client_id_listing_id_key;

-- Step 4: Create partial unique index for profile-only likes (listing_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS owner_likes_profile_only_unique
ON owner_likes (owner_id, client_id)
WHERE listing_id IS NULL;

-- Step 5: Create unique index for listing-specific likes (listing_id IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS owner_likes_listing_specific_unique
ON owner_likes (owner_id, client_id, listing_id)
WHERE listing_id IS NOT NULL;

-- Step 6: Add check constraint to prevent self-likes
ALTER TABLE owner_likes 
ADD CONSTRAINT prevent_self_like 
CHECK (owner_id != client_id);