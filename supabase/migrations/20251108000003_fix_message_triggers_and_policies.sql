-- Fix triggers and functions that reference old column names after schema migration
-- This migration ensures all triggers use message_text instead of content

-- Update the trigger function to use message_text instead of content
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message = NEW.message_text,
    last_message_at = NEW.created_at,
    last_message_sender_id = NEW.sender_id,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$;

-- Recreate the trigger to ensure it's using the updated function
DROP TRIGGER IF EXISTS trg_update_conversation_last_message ON public.conversation_messages;
CREATE TRIGGER trg_update_conversation_last_message
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Update the notify_new_message function to use message_text instead of content
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_name TEXT;
  message_preview TEXT;
BEGIN
  -- Get sender name (use full_name instead of name)
  SELECT full_name INTO sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;

  -- Create message preview (first 50 chars)
  message_preview := LEFT(NEW.message_text, 50);
  IF LENGTH(NEW.message_text) > 50 THEN
    message_preview := message_preview || '...';
  END IF;

  -- Send notification to receiver (only if send_notification function exists)
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'send_notification') THEN
    PERFORM public.send_notification(
      p_user_id := NEW.receiver_id,
      p_type := 'new_message'::public.notification_type,
      p_title := 'New message from ' || COALESCE(sender_name, 'Someone'),
      p_message := message_preview,
      p_link_url := '/messages/' || NEW.conversation_id::text,
      p_related_user_id := NEW.sender_id,
      p_metadata := jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'message_id', NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trg_notify_new_message ON public.conversation_messages;
CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

-- Update RLS policies for conversation_messages to work with both schema versions
-- This ensures messages work whether conversations use participant_*_id or client_id/owner_id

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.conversation_messages;
CREATE POLICY "Users can view messages in their conversations"
  ON public.conversation_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.conversation_messages;
CREATE POLICY "Users can send messages in their conversations"
  ON public.conversation_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (
          -- Support both old (participant_*_id) and new (client_id/owner_id) schema
          (c.participant_1_id IS NOT NULL AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid()))
          OR
          (c.client_id IS NOT NULL AND (c.client_id = auth.uid() OR c.owner_id = auth.uid()))
        )
    )
  );

DROP POLICY IF EXISTS "Users can update their own messages" ON public.conversation_messages;
CREATE POLICY "Users can update their own messages"
  ON public.conversation_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Update typing indicators policy to work with both schemas
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'typing_indicators') THEN
    DROP POLICY IF EXISTS "Conversation participants can view typing indicators" ON public.typing_indicators;

    CREATE POLICY "Conversation participants can view typing indicators"
      ON public.typing_indicators
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.conversations c
          WHERE c.id = typing_indicators.conversation_id
            AND (
              -- Support both old and new schema
              (c.participant_1_id IS NOT NULL AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid()))
              OR
              (c.client_id IS NOT NULL AND (c.client_id = auth.uid() OR c.owner_id = auth.uid()))
            )
        )
      );
  END IF;
END $$;

-- Update message attachments policy to work with receiver_id auto-population
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_attachments') THEN
    DROP POLICY IF EXISTS "Users can view attachments in their conversations" ON public.message_attachments;

    CREATE POLICY "Users can view attachments in their conversations"
      ON public.message_attachments
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.conversation_messages cm
          INNER JOIN public.conversations c ON c.id = cm.conversation_id
          WHERE cm.id = message_attachments.message_id
            AND (
              cm.sender_id = auth.uid()
              OR cm.receiver_id = auth.uid()
              OR (c.participant_1_id IS NOT NULL AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid()))
              OR (c.client_id IS NOT NULL AND (c.client_id = auth.uid() OR c.owner_id = auth.uid()))
            )
        )
      );
  END IF;
END $$;

COMMENT ON FUNCTION update_conversation_last_message IS 'Updates conversation last message using message_text column';
COMMENT ON FUNCTION notify_new_message IS 'Sends notification for new messages using message_text column';
