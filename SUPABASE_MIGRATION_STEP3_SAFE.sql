-- =============================================================================
-- STEP 3: Fix message triggers and policies (SAFE VERSION)
-- Updated to work with BOTH 'content' and 'message_text' columns
-- =============================================================================

-- Update the function that updates conversation last_message
-- Uses COALESCE to support both column names during transition
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message = COALESCE(NEW.message_text, NEW.content),
    last_message_at = NEW.created_at,
    last_message_sender_id = NEW.sender_id,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON public.conversation_messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Update notification function to include both column names
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_message:' || NEW.conversation_id,
    json_build_object(
      'id', NEW.id,
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'receiver_id', NEW.receiver_id,
      'message_text', COALESCE(NEW.message_text, NEW.content),
      'content', COALESCE(NEW.content, NEW.message_text),
      'created_at', NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate notification trigger
DROP TRIGGER IF EXISTS trigger_notify_new_message ON public.conversation_messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Update RLS policies for conversation_messages
-- Wrapped in transaction for atomic policy update
BEGIN;

DROP POLICY IF EXISTS "Users can view their messages" ON public.conversation_messages;
CREATE POLICY "Users can view their messages"
  ON public.conversation_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id
    OR auth.uid() = receiver_id
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.client_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert their own messages" ON public.conversation_messages;
CREATE POLICY "Users can insert their own messages"
  ON public.conversation_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.client_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

COMMIT;
