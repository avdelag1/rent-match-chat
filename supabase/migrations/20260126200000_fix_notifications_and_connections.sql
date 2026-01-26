-- =====================================================
-- FIX NOTIFICATIONS AND DATABASE CONNECTIONS
-- Created: 2026-01-26
-- Purpose: Add missing notification triggers, fix policies, ensure proper connections
-- =====================================================

-- =====================================================
-- PART 1: ADD NOTIFICATION TRIGGER FOR LIKES
-- When a client likes a listing, notify the listing owner
-- =====================================================

CREATE OR REPLACE FUNCTION notify_listing_owner_on_like()
RETURNS TRIGGER AS $$
DECLARE
  v_listing RECORD;
  v_liker_profile RECORD;
  v_listing_category TEXT;
BEGIN
  -- Get listing details
  SELECT id, owner_id, title, category
  INTO v_listing
  FROM public.listings
  WHERE id = NEW.target_listing_id;

  -- Get liker profile
  SELECT id, full_name, avatar
  INTO v_liker_profile
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Only notify if we have valid data
  IF v_listing.owner_id IS NOT NULL AND v_liker_profile.id IS NOT NULL THEN
    -- Insert notification for the listing owner
    INSERT INTO public.notifications (
      user_id,
      notification_type,
      title,
      message,
      link_url,
      related_user_id,
      related_property_id,
      metadata
    ) VALUES (
      v_listing.owner_id,
      'new_like',
      COALESCE(v_liker_profile.full_name, 'Someone') || ' liked your listing',
      'Your listing "' || COALESCE(v_listing.title, 'Untitled') || '" received a new like!',
      '/owner/liked-clients',
      NEW.user_id,
      NEW.target_listing_id,
      jsonb_build_object(
        'liker_name', v_liker_profile.full_name,
        'liker_avatar', v_liker_profile.avatar,
        'listing_title', v_listing.title,
        'listing_category', v_listing.category
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS trg_notify_listing_owner_on_like ON public.likes;
CREATE TRIGGER trg_notify_listing_owner_on_like
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_listing_owner_on_like();

-- =====================================================
-- PART 2: ADD NOTIFICATION TRIGGER FOR OWNER LIKES
-- When an owner likes a client, notify the client
-- =====================================================

CREATE OR REPLACE FUNCTION notify_client_on_owner_like()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_profile RECORD;
BEGIN
  -- Get owner profile
  SELECT id, full_name, avatar
  INTO v_owner_profile
  FROM public.profiles
  WHERE id = NEW.owner_id;

  -- Notify the client
  IF v_owner_profile.id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      notification_type,
      title,
      message,
      link_url,
      related_user_id,
      metadata
    ) VALUES (
      NEW.client_id,
      'new_like',
      COALESCE(v_owner_profile.full_name, 'A property owner') || ' is interested in you!',
      'Great news! A property owner has shown interest in your profile.',
      '/client/matches',
      NEW.owner_id,
      jsonb_build_object(
        'owner_name', v_owner_profile.full_name,
        'owner_avatar', v_owner_profile.avatar,
        'like_type', 'owner_to_client'
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS trg_notify_client_on_owner_like ON public.owner_likes;
CREATE TRIGGER trg_notify_client_on_owner_like
  AFTER INSERT ON public.owner_likes
  FOR EACH ROW
  EXECUTE FUNCTION notify_client_on_owner_like();

-- =====================================================
-- PART 3: ADD NOTIFICATION TRIGGER FOR NEW MESSAGES
-- When a message is sent, notify the receiver
-- =====================================================

-- Check if function exists and update it
CREATE OR REPLACE FUNCTION notify_message_receiver()
RETURNS TRIGGER AS $$
DECLARE
  v_sender_profile RECORD;
  v_conversation RECORD;
BEGIN
  -- Get sender profile
  SELECT id, full_name, avatar
  INTO v_sender_profile
  FROM public.profiles
  WHERE id = NEW.sender_id;

  -- Get conversation details
  SELECT id, client_id, owner_id, listing_id
  INTO v_conversation
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  -- Notify the receiver (if not the sender)
  IF NEW.receiver_id IS NOT NULL AND NEW.receiver_id != NEW.sender_id THEN
    INSERT INTO public.notifications (
      user_id,
      notification_type,
      title,
      message,
      link_url,
      related_user_id,
      metadata
    ) VALUES (
      NEW.receiver_id,
      'new_message',
      'New message from ' || COALESCE(v_sender_profile.full_name, 'Someone'),
      CASE
        WHEN LENGTH(NEW.message_text) > 50 THEN LEFT(NEW.message_text, 50) || '...'
        ELSE NEW.message_text
      END,
      '/messages/' || NEW.conversation_id,
      NEW.sender_id,
      jsonb_build_object(
        'sender_name', v_sender_profile.full_name,
        'sender_avatar', v_sender_profile.avatar,
        'conversation_id', NEW.conversation_id,
        'message_preview', LEFT(NEW.message_text, 100)
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS trg_notify_message_receiver ON public.conversation_messages;
CREATE TRIGGER trg_notify_message_receiver
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_message_receiver();

-- =====================================================
-- PART 4: ADD NOTIFICATION TRIGGER FOR MATCHES
-- When both sides like each other (mutual match), notify both
-- =====================================================

CREATE OR REPLACE FUNCTION check_and_notify_match()
RETURNS TRIGGER AS $$
DECLARE
  v_listing RECORD;
  v_client_profile RECORD;
  v_owner_profile RECORD;
  v_is_match BOOLEAN := FALSE;
BEGIN
  -- Get the listing that was liked
  SELECT id, owner_id, title, category
  INTO v_listing
  FROM public.listings
  WHERE id = NEW.target_listing_id;

  -- Check if owner has also liked this client
  SELECT EXISTS (
    SELECT 1 FROM public.owner_likes
    WHERE owner_id = v_listing.owner_id
    AND client_id = NEW.user_id
  ) INTO v_is_match;

  -- If it's a match, notify both parties
  IF v_is_match THEN
    -- Get profiles
    SELECT id, full_name, avatar INTO v_client_profile
    FROM public.profiles WHERE id = NEW.user_id;

    SELECT id, full_name, avatar INTO v_owner_profile
    FROM public.profiles WHERE id = v_listing.owner_id;

    -- Notify the client
    INSERT INTO public.notifications (
      user_id, notification_type, title, message, link_url,
      related_user_id, related_property_id, metadata
    ) VALUES (
      NEW.user_id,
      'new_match',
      'It''s a Match! 🎉',
      'You matched with ' || COALESCE(v_owner_profile.full_name, 'a property owner') || '!',
      '/client/matches',
      v_listing.owner_id,
      NEW.target_listing_id,
      jsonb_build_object(
        'match_type', 'client_owner',
        'listing_title', v_listing.title,
        'owner_name', v_owner_profile.full_name
      )
    );

    -- Notify the owner
    INSERT INTO public.notifications (
      user_id, notification_type, title, message, link_url,
      related_user_id, related_property_id, metadata
    ) VALUES (
      v_listing.owner_id,
      'new_match',
      'It''s a Match! 🎉',
      'You matched with ' || COALESCE(v_client_profile.full_name, 'a client') || '!',
      '/owner/matches',
      NEW.user_id,
      NEW.target_listing_id,
      jsonb_build_object(
        'match_type', 'owner_client',
        'listing_title', v_listing.title,
        'client_name', v_client_profile.full_name
      )
    );

    -- Insert into matches table if it exists
    INSERT INTO public.matches (client_id, owner_id, listing_id, matched_at)
    VALUES (NEW.user_id, v_listing.owner_id, NEW.target_listing_id, NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS trg_check_match_on_like ON public.likes;
CREATE TRIGGER trg_check_match_on_like
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION check_and_notify_match();

-- Also check for match when owner likes a client
CREATE OR REPLACE FUNCTION check_and_notify_match_from_owner()
RETURNS TRIGGER AS $$
DECLARE
  v_client_profile RECORD;
  v_owner_profile RECORD;
  v_matching_like RECORD;
BEGIN
  -- Check if client has liked any of owner's listings
  SELECT l.*, lst.title as listing_title, lst.id as listing_id
  INTO v_matching_like
  FROM public.likes l
  JOIN public.listings lst ON lst.id = l.target_listing_id
  WHERE l.user_id = NEW.client_id
  AND lst.owner_id = NEW.owner_id
  LIMIT 1;

  -- If it's a match, notify both parties
  IF v_matching_like IS NOT NULL THEN
    -- Get profiles
    SELECT id, full_name, avatar INTO v_client_profile
    FROM public.profiles WHERE id = NEW.client_id;

    SELECT id, full_name, avatar INTO v_owner_profile
    FROM public.profiles WHERE id = NEW.owner_id;

    -- Notify the client
    INSERT INTO public.notifications (
      user_id, notification_type, title, message, link_url,
      related_user_id, related_property_id, metadata
    ) VALUES (
      NEW.client_id,
      'new_match',
      'It''s a Match! 🎉',
      'You matched with ' || COALESCE(v_owner_profile.full_name, 'a property owner') || '!',
      '/client/matches',
      NEW.owner_id,
      v_matching_like.listing_id,
      jsonb_build_object(
        'match_type', 'client_owner',
        'listing_title', v_matching_like.listing_title,
        'owner_name', v_owner_profile.full_name
      )
    );

    -- Notify the owner
    INSERT INTO public.notifications (
      user_id, notification_type, title, message, link_url,
      related_user_id, related_property_id, metadata
    ) VALUES (
      NEW.owner_id,
      'new_match',
      'It''s a Match! 🎉',
      'You matched with ' || COALESCE(v_client_profile.full_name, 'a client') || '!',
      '/owner/matches',
      NEW.client_id,
      v_matching_like.listing_id,
      jsonb_build_object(
        'match_type', 'owner_client',
        'listing_title', v_matching_like.listing_title,
        'client_name', v_client_profile.full_name
      )
    );

    -- Insert into matches table
    INSERT INTO public.matches (client_id, owner_id, listing_id, matched_at)
    VALUES (NEW.client_id, NEW.owner_id, v_matching_like.listing_id, NOW())
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS trg_check_match_on_owner_like ON public.owner_likes;
CREATE TRIGGER trg_check_match_on_owner_like
  AFTER INSERT ON public.owner_likes
  FOR EACH ROW
  EXECUTE FUNCTION check_and_notify_match_from_owner();

-- =====================================================
-- PART 5: CREATE MATCHES TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, owner_id, listing_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_matches_client_id ON public.matches(client_id);
CREATE INDEX IF NOT EXISTS idx_matches_owner_id ON public.matches(owner_id);
CREATE INDEX IF NOT EXISTS idx_matches_matched_at ON public.matches(matched_at DESC);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Policies for matches
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
CREATE POLICY "Users can view their own matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "System can insert matches" ON public.matches;
CREATE POLICY "System can insert matches"
  ON public.matches FOR INSERT
  WITH CHECK (TRUE);

-- =====================================================
-- PART 6: ADD MISSING INSERT POLICY FOR ACTIVATION USAGE LOG
-- =====================================================

-- Check if policy exists and create if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'activation_usage_log'
    AND policyname = 'Users can log their own usage'
  ) THEN
    CREATE POLICY "Users can log their own usage"
      ON public.activation_usage_log
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- PART 7: ADD MESSAGE_ACTIVATION_REQUIRED FLAG TO CONVERSATIONS
-- This tracks whether a conversation required message activation
-- =====================================================

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS requires_activation BOOLEAN DEFAULT FALSE;

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS activation_used_at TIMESTAMPTZ;

-- Update existing property conversations to require activation
UPDATE public.conversations c
SET requires_activation = TRUE
WHERE EXISTS (
  SELECT 1 FROM public.listings l
  WHERE l.id = c.listing_id
  AND l.category = 'property'
);

-- =====================================================
-- PART 8: CREATE FUNCTION TO CHECK IF ACTIVATION REQUIRED
-- Based on listing category (property = paid, others = free)
-- =====================================================

CREATE OR REPLACE FUNCTION check_message_activation_required(
  p_listing_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_category TEXT;
BEGIN
  SELECT category INTO v_category
  FROM public.listings
  WHERE id = p_listing_id;

  -- Only properties require message activation
  -- motorcycles, bicycles, workers (dog sitting, baby sitting) are FREE
  RETURN v_category = 'property';
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION check_message_activation_required(UUID) TO authenticated;

-- =====================================================
-- PART 9: CREATE FUNCTION TO USE MESSAGE ACTIVATION
-- =====================================================

CREATE OR REPLACE FUNCTION use_message_activation(
  p_user_id UUID,
  p_conversation_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_activation RECORD;
  v_listing_id UUID;
  v_requires_activation BOOLEAN;
BEGIN
  -- Get conversation's listing
  SELECT listing_id INTO v_listing_id
  FROM public.conversations
  WHERE id = p_conversation_id;

  -- Check if activation is required
  v_requires_activation := check_message_activation_required(v_listing_id);

  -- If not required, return TRUE (free chat)
  IF NOT v_requires_activation THEN
    RETURN TRUE;
  END IF;

  -- Find an active activation with remaining credits
  SELECT * INTO v_activation
  FROM public.message_activations
  WHERE user_id = p_user_id
  AND remaining_count > 0
  AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY expires_at ASC NULLS LAST
  LIMIT 1;

  -- If no activation found, return FALSE
  IF v_activation IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Deduct one activation
  UPDATE public.message_activations
  SET remaining_count = remaining_count - 1,
      updated_at = NOW()
  WHERE id = v_activation.id;

  -- Log the usage
  INSERT INTO public.activation_usage_log (user_id, activation_id, conversation_id, context)
  VALUES (p_user_id, v_activation.id, p_conversation_id, 'new_conversation');

  -- Mark conversation as activation used
  UPDATE public.conversations
  SET requires_activation = TRUE,
      activation_used_at = NOW()
  WHERE id = p_conversation_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION use_message_activation(UUID, UUID) TO authenticated;

-- =====================================================
-- PART 10: ADD FOREIGN KEY CONSTRAINTS WHERE MISSING
-- =====================================================

-- Add FK to notifications.related_message_id if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications'
    AND column_name = 'related_message_id'
  ) THEN
    -- Check if FK already exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'notifications_related_message_id_fkey'
    ) THEN
      ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_related_message_id_fkey
      FOREIGN KEY (related_message_id)
      REFERENCES public.conversation_messages(id)
      ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- =====================================================
-- PART 11: SUMMARY COMMENTS
-- =====================================================

COMMENT ON FUNCTION notify_listing_owner_on_like() IS
'Trigger function: Notifies listing owner when a client likes their listing';

COMMENT ON FUNCTION notify_client_on_owner_like() IS
'Trigger function: Notifies client when an owner likes them';

COMMENT ON FUNCTION notify_message_receiver() IS
'Trigger function: Notifies user when they receive a new message';

COMMENT ON FUNCTION check_and_notify_match() IS
'Trigger function: Checks for mutual match when client likes, notifies both parties';

COMMENT ON FUNCTION check_message_activation_required(UUID) IS
'Returns TRUE if listing category requires message activation (only property)';

COMMENT ON TABLE public.matches IS
'Tracks mutual matches between clients and owners';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'NOTIFICATION AND CONNECTION FIXES COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Added Triggers:';
  RAISE NOTICE '  1. trg_notify_listing_owner_on_like - Client likes → Owner notified';
  RAISE NOTICE '  2. trg_notify_client_on_owner_like - Owner likes → Client notified';
  RAISE NOTICE '  3. trg_notify_message_receiver - New message → Receiver notified';
  RAISE NOTICE '  4. trg_check_match_on_like - Check for mutual match';
  RAISE NOTICE '  5. trg_check_match_on_owner_like - Check for mutual match from owner';
  RAISE NOTICE '';
  RAISE NOTICE 'Added Tables:';
  RAISE NOTICE '  - matches (tracks mutual likes)';
  RAISE NOTICE '';
  RAISE NOTICE 'Added Functions:';
  RAISE NOTICE '  - check_message_activation_required(listing_id)';
  RAISE NOTICE '  - use_message_activation(user_id, conversation_id)';
  RAISE NOTICE '';
  RAISE NOTICE 'Message Activation Rules:';
  RAISE NOTICE '  - Property listings: REQUIRES activation (paid)';
  RAISE NOTICE '  - Motorcycles, Bicycles, Workers: FREE chat';
  RAISE NOTICE '============================================================';
END $$;
