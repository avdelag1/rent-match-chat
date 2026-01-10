-- =============================================================================
-- STEP 1B: Create indexes CONCURRENTLY (SAFE VERSION)
-- Run OUTSIDE any transaction - each statement runs separately
-- NOTE: Must run AFTER STEP1 completes successfully
-- =============================================================================

-- IMPORTANT: Do NOT wrap these in BEGIN/COMMIT or a DO block!
-- CONCURRENTLY cannot run inside a transaction.

-- Index on client_id for conversation lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_client_id
  ON public.conversations(client_id);

-- Index on owner_id for conversation lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_owner_id
  ON public.conversations(owner_id);

-- Index on listing_id for filtering by listing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_listing_id
  ON public.conversations(listing_id);

-- Index on match_id for filtering by match
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_match_id
  ON public.conversations(match_id);

-- Unique partial index for active conversation pairs
-- This replaces the old unique_conversation constraint
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_unique_pair
  ON public.conversations(LEAST(client_id, owner_id), GREATEST(client_id, owner_id))
  WHERE status = 'active';
