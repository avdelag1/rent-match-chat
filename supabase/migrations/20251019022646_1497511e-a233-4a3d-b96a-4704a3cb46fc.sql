-- Fix RLS policy issue for likes table
-- Make user_id and target_id NOT NULL to prevent RLS violations
ALTER TABLE likes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE likes ALTER COLUMN target_id SET NOT NULL;
ALTER TABLE likes ALTER COLUMN direction SET NOT NULL;

-- Add a comment explaining the change
COMMENT ON COLUMN likes.user_id IS 'User ID must be set and match auth.uid() for RLS to work correctly';
COMMENT ON COLUMN likes.target_id IS 'Target ID (listing or profile) must always be set';
COMMENT ON COLUMN likes.direction IS 'Direction must be either left or right';