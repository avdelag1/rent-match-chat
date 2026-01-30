-- ============================================
-- VERIFICATION & FIX: Match Trigger
-- Date: 2026-01-30
-- Purpose: Verify triggers exist and fix mutual match logic
-- ============================================

-- ============================================
-- STEP 1: VERIFICATION QUERIES (Run these first)
-- ============================================

-- A. Check if likes table has correct columns
-- Expected: id, user_id, target_id, target_type, direction, source, created_at
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'likes'
ORDER BY ordinal_position;

-- B. Check active triggers on likes table
SELECT
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'likes';

-- C. Check existing matches
SELECT COUNT(*) as total_matches FROM public.matches;
SELECT * FROM public.matches LIMIT 10;

-- D. Check notifications for matches
SELECT COUNT(*) as match_notifications
FROM public.notifications
WHERE type = 'match';

-- E. Check owner_likes table (for owner → client likes)
SELECT COUNT(*) as owner_likes FROM public.owner_likes;

-- ============================================
-- STEP 2: FIX THE MATCH TRIGGER (Run if needed)
-- ============================================

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS trg_create_match_on_like ON public.likes;
DROP FUNCTION IF EXISTS public.create_match_on_mutual_like();

-- Create improved function for TRUE mutual matching
-- Logic: Match is created when BOTH have liked:
-- 1. Client likes listing (insert into likes table)
-- 2. Owner likes client (insert into owner_likes table)
-- 3. Trigger fires and creates match

CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
DECLARE
  listing_owner UUID;
  existing_match UUID;
  owner_has_liked_client BOOLEAN;
BEGIN
  -- Only proceed for right swipes (likes) on listings
  IF NEW.target_type = 'listing' AND NEW.direction = 'right' THEN

    -- Get the listing owner
    SELECT owner_id INTO listing_owner
    FROM public.listings
    WHERE id = NEW.target_id;

    -- If no listing found, exit
    IF listing_owner IS NULL THEN
      RETURN NEW;
    END IF;

    -- Check if this is a CLIENT liking a listing (not owner liking client)
    -- by verifying the user_id is NOT the listing owner
    IF NEW.user_id = listing_owner THEN
      -- Owner is liking their own listing - no match needed
      RETURN NEW;
    END IF;

    -- Check if owner has already liked this client back
    -- Look in owner_likes table for owner → client like
    SELECT EXISTS (
      SELECT 1 FROM public.owner_likes
      WHERE owner_id = listing_owner
        AND client_id = NEW.user_id
        AND (listing_id = NEW.target_id OR listing_id IS NULL)
    ) INTO owner_has_liked_client;

    -- Only create match if owner has liked client back
    IF owner_has_liked_client THEN

      -- Check if match already exists
      SELECT id INTO existing_match
      FROM public.matches
      WHERE listing_id = NEW.target_id
        AND client_id = NEW.user_id;

      -- Create match if doesn't exist
      IF existing_match IS NULL THEN
        INSERT INTO public.matches (listing_id, client_id, owner_id, status)
        VALUES (NEW.target_id, NEW.user_id, listing_owner, 'pending');

        -- Create notification for CLIENT
        INSERT INTO public.notifications (user_id, type, title, content, data)
        VALUES (
          NEW.user_id,
          'match',
          'New Match! 🎉',
          'You and the owner liked each other! Start chatting now.',
          json_build_object(
            'listing_id', NEW.target_id,
            'match_type', 'mutual',
            'owner_id', listing_owner
          )
        );

        -- Create notification for OWNER
        INSERT INTO public.notifications (user_id, type, title, content, data)
        VALUES (
          listing_owner,
          'match',
          'New Match! 🎉',
          'You and the client liked each other! Start chatting now.',
          json_build_object(
            'listing_id', NEW.target_id,
            'match_type', 'mutual',
            'client_id', NEW.user_id
          )
        );

        RAISE NOTICE 'Match created between client % and owner % for listing %',
          NEW.user_id, listing_owner, NEW.target_id;
      END IF;
    ELSE
      -- Owner hasn't liked client back yet
      -- Create a "pending like" notification for the owner
      INSERT INTO public.notifications (user_id, type, title, content, data)
      VALUES (
        listing_owner,
        'like',
        'New Interest!',
        'Someone liked your listing. Check them out!',
        json_build_object(
          'listing_id', NEW.target_id,
          'liked_by', NEW.user_id,
          'like_type', 'pending_mutual'
        )
      );

      RAISE NOTICE 'Like saved from client %. Waiting for owner to like back.',
        NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on likes table
CREATE TRIGGER trg_create_match_on_like
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_mutual_like();

-- ============================================
-- STEP 3: ALSO TRIGGER ON OWNER LIKES
-- ============================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trg_owner_like_match ON public.owner_likes;

-- Create function for owner → client likes
CREATE OR REPLACE FUNCTION create_match_on_owner_like()
RETURNS TRIGGER AS $$
DECLARE
  existing_match UUID;
  client_already_liked BOOLEAN;
BEGIN
  -- Only proceed if this is a super like or regular like
  -- (we treat any like from owner as interest)

  -- Check if client has already liked this listing back
  -- Look in likes table for client → listing like
  SELECT EXISTS (
    SELECT 1 FROM public.likes
    WHERE user_id = NEW.client_id
      AND target_id = COALESCE(NEW.listing_id, (
        SELECT id FROM public.listings WHERE owner_id = NEW.owner_id LIMIT 1
      ))
      AND target_type = 'listing'
      AND direction = 'right'
  ) INTO client_already_liked;

  -- If client already liked, create match
  IF client_already_liked THEN
    -- Get the listing ID if not provided
    IF NEW.listing_id IS NULL THEN
      SELECT id INTO NEW.listing_id
      FROM public.listings
      WHERE owner_id = NEW.owner_id
      LIMIT 1;
    END IF;

    -- Check if match already exists
    SELECT id INTO existing_match
    FROM public.matches
    WHERE listing_id = NEW.listing_id
      AND client_id = NEW.client_id;

    -- Create match if doesn't exist
    IF existing_match IS NULL AND NEW.listing_id IS NOT NULL THEN
      INSERT INTO public.matches (listing_id, client_id, owner_id, status)
      VALUES (NEW.listing_id, NEW.client_id, NEW.owner_id, 'pending');

      -- Notify client
      INSERT INTO public.notifications (user_id, type, title, content, data)
      VALUES (
        NEW.client_id,
        'match',
        'New Match! 🎉',
        'The owner liked you back! Start chatting now.',
        json_build_object(
          'listing_id', NEW.listing_id,
          'match_type', 'mutual',
          'owner_id', NEW.owner_id
        )
      );

      -- Notify owner
      INSERT INTO public.notifications (user_id, type, title, content, data)
      VALUES (
        NEW.owner_id,
        'match',
        'New Match! 🎉',
        'You and the client liked each other!',
        json_build_object(
          'listing_id', NEW.listing_id,
          'match_type', 'mutual',
          'client_id', NEW.client_id
        )
      );

      RAISE NOTICE 'Match created via owner like: client %, owner %',
        NEW.client_id, NEW.owner_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on owner_likes table
CREATE TRIGGER trg_owner_like_match
  AFTER INSERT ON public.owner_likes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_owner_like();

-- ============================================
-- STEP 4: VERIFICATION AFTER FIX
-- ============================================

-- Check triggers again
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table IN ('likes', 'owner_likes');

-- ============================================
-- TEST QUERIES (Run in order)
-- ============================================

-- Test 1: See if any likes exist
-- SELECT * FROM public.likes ORDER BY created_at DESC LIMIT 5;

-- Test 2: See if any owner_likes exist
-- SELECT * FROM public.owner_likes ORDER BY created_at DESC LIMIT 5;

-- Test 3: See if matches were created
-- SELECT * FROM public.matches ORDER BY created_at DESC LIMIT 10;

-- Test 4: See notifications
-- SELECT * FROM public.notifications WHERE type = 'match' ORDER BY created_at DESC;
