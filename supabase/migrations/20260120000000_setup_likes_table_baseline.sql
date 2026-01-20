-- ============================================================================
-- LIKES TABLE BASELINE MIGRATION
-- ============================================================================
-- Date: 2026-01-20
-- Purpose: Restructure likes table to match the baseline spec
-- This migration:
--   1. Restructures likes table to use target_listing_id with FK to listings
--   2. Removes direction field (likes only, dislikes are in separate table)
--   3. Sets up correct RLS policies for users AND owners
-- ============================================================================

-- ============================================================================
-- PART 1: BACKUP AND DROP OLD CONSTRAINTS/POLICIES
-- ============================================================================

-- Drop existing policies on likes table
DROP POLICY IF EXISTS "Allow authenticated users to read likes" ON public.likes;
DROP POLICY IF EXISTS "likes_insert_active_users" ON public.likes;
DROP POLICY IF EXISTS "users can read their own likes" ON public.likes;
DROP POLICY IF EXISTS "users can like listings" ON public.likes;
DROP POLICY IF EXISTS "users can unlike" ON public.likes;
DROP POLICY IF EXISTS "owners can see likes on their listings" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can view own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON public.likes;

-- Drop existing indexes (they reference old column names)
DROP INDEX IF EXISTS idx_likes_unique_constraint;
DROP INDEX IF EXISTS idx_likes_user_id;
DROP INDEX IF EXISTS idx_likes_target_id;
DROP INDEX IF EXISTS idx_likes_direction;
DROP INDEX IF EXISTS idx_likes_created_at;
DROP INDEX IF EXISTS idx_likes_user_target;
DROP INDEX IF EXISTS idx_likes_disliked_at;

-- Drop existing constraints
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS unique_user_target_direction;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_target_id_direction_key;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_target_listing_id_key;

-- ============================================================================
-- PART 2: RESTRUCTURE LIKES TABLE
-- ============================================================================

-- Add new target_listing_id column (nullable first for migration)
ALTER TABLE public.likes
ADD COLUMN IF NOT EXISTS target_listing_id UUID;

-- Migrate existing data: copy target_id to target_listing_id for right swipes only
-- This preserves existing likes while removing direction dependency
UPDATE public.likes
SET target_listing_id = target_id
WHERE direction = 'right'
  AND target_listing_id IS NULL
  AND target_id IN (SELECT id FROM public.listings);

-- Delete non-like records (left swipes should be in dislikes table)
-- and records where target_id doesn't reference a valid listing
DELETE FROM public.likes
WHERE direction = 'left'
   OR target_id NOT IN (SELECT id FROM public.listings);

-- Now make target_listing_id NOT NULL and add FK constraint
ALTER TABLE public.likes
ALTER COLUMN target_listing_id SET NOT NULL;

-- Add foreign key constraint to listings with cascade delete
ALTER TABLE public.likes
ADD CONSTRAINT likes_target_listing_id_fkey
FOREIGN KEY (target_listing_id)
REFERENCES public.listings(id)
ON DELETE CASCADE;

-- Add foreign key constraint to auth.users with cascade delete (if not exists)
ALTER TABLE public.likes
DROP CONSTRAINT IF EXISTS likes_user_id_fkey;

ALTER TABLE public.likes
ADD CONSTRAINT likes_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Drop old columns that are no longer needed
ALTER TABLE public.likes DROP COLUMN IF EXISTS target_id;
ALTER TABLE public.likes DROP COLUMN IF EXISTS direction;
ALTER TABLE public.likes DROP COLUMN IF EXISTS disliked_at;

-- Add unique constraint to prevent duplicate likes
ALTER TABLE public.likes
ADD CONSTRAINT likes_user_listing_unique
UNIQUE (user_id, target_listing_id);

-- ============================================================================
-- PART 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for user's likes lookup
CREATE INDEX IF NOT EXISTS idx_likes_user_id
ON public.likes(user_id);

-- Index for listing likes lookup (for owners)
CREATE INDEX IF NOT EXISTS idx_likes_target_listing_id
ON public.likes(target_listing_id);

-- Index for chronological ordering
CREATE INDEX IF NOT EXISTS idx_likes_created_at
ON public.likes(created_at DESC);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_likes_user_listing
ON public.likes(user_id, target_listing_id);

-- ============================================================================
-- PART 4: ENABLE RLS AND CREATE PROPER POLICIES
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own likes
CREATE POLICY "users can read their own likes"
ON public.likes
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can insert likes (with active user check)
CREATE POLICY "users can like listings"
ON public.likes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND public.is_user_active(auth.uid())
);

-- Policy 3: Users can delete their own likes (unlike)
CREATE POLICY "users can unlike"
ON public.likes
FOR DELETE
USING (auth.uid() = user_id);

-- Policy 4: CRITICAL - Owners can see likes on their listings
-- This is the missing piece that causes "owners can't see interested clients"
CREATE POLICY "owners can see likes on their listings"
ON public.likes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.listings
    WHERE listings.id = likes.target_listing_id
    AND listings.owner_id = auth.uid()
  )
);

-- ============================================================================
-- PART 5: ADD TABLE AND COLUMN COMMENTS
-- ============================================================================

COMMENT ON TABLE public.likes IS
'Stores user likes on listings. Single source of truth for client interest.
Supports: client viewing own likes, owners seeing who liked their listings.';

COMMENT ON COLUMN public.likes.id IS 'Unique identifier for the like';
COMMENT ON COLUMN public.likes.user_id IS 'User who liked the listing (references auth.users)';
COMMENT ON COLUMN public.likes.target_listing_id IS 'Listing that was liked (references listings)';
COMMENT ON COLUMN public.likes.created_at IS 'When the like was created';

-- ============================================================================
-- PART 6: CREATE HELPER VIEW FOR OWNER QUERIES (OPTIONAL)
-- ============================================================================

-- Create a view that makes it easy for owners to see interested clients
CREATE OR REPLACE VIEW public.listing_interested_clients AS
SELECT
  l.id as like_id,
  l.created_at,
  l.user_id,
  l.target_listing_id,
  p.full_name,
  p.avatar,
  lst.title as listing_title,
  lst.owner_id
FROM public.likes l
JOIN public.profiles p ON p.id = l.user_id
JOIN public.listings lst ON lst.id = l.target_listing_id;

-- Add RLS to the view
ALTER VIEW public.listing_interested_clients SET (security_invoker = true);

COMMENT ON VIEW public.listing_interested_clients IS
'View showing clients who liked each listing with profile info.
Owners can query this to see who is interested in their properties.';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'LIKES TABLE BASELINE SETUP COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Schema:';
  RAISE NOTICE '  - likes.id (UUID, PK)';
  RAISE NOTICE '  - likes.user_id (UUID, FK -> auth.users, cascade delete)';
  RAISE NOTICE '  - likes.target_listing_id (UUID, FK -> listings, cascade delete)';
  RAISE NOTICE '  - likes.created_at (TIMESTAMPTZ)';
  RAISE NOTICE '  - UNIQUE(user_id, target_listing_id)';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies:';
  RAISE NOTICE '  - Users can read their own likes';
  RAISE NOTICE '  - Users can insert likes (active users only)';
  RAISE NOTICE '  - Users can delete their own likes';
  RAISE NOTICE '  - Owners can see likes on their listings';
  RAISE NOTICE '';
  RAISE NOTICE 'This fixes:';
  RAISE NOTICE '  - "Likes disappear" bug (RLS SELECT was wrong)';
  RAISE NOTICE '  - "Owners cant see interested clients" (missing policy)';
  RAISE NOTICE '============================================================';
END $$;
