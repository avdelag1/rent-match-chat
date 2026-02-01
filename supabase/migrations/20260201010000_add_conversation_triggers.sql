-- ============================================
-- Add conversation message triggers
--
-- Two triggers that fire on every new message:
--   1. update_conversation_last_message  – writes the latest
--      message text + timestamp back to the conversations row so
--      the conversation list can show a preview without a join.
--   2. notify_new_message  – fires pg_notify so any realtime
--      listener on the conversation channel receives the new
--      message immediately.
--
-- Neither trigger existed in previous migrations; only the generic
-- update_updated_at_column trigger was defined.
-- ============================================

-- ============================================
-- Trigger 1: keep conversations.last_message in sync
-- ============================================

CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message            = NEW.message_text,
    last_message_at         = NEW.created_at,
    last_message_sender_id  = NEW.sender_id,
    updated_at              = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_last_message
  ON public.conversation_messages;

CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

-- ============================================
-- Trigger 2: pg_notify for realtime messaging
-- ============================================

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_message:' || NEW.conversation_id,
    json_build_object(
      'id',              NEW.id,
      'conversation_id', NEW.conversation_id,
      'sender_id',       NEW.sender_id,
      'receiver_id',     NEW.receiver_id,
      'message_text',    NEW.message_text,
      'created_at',      NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_message
  ON public.conversation_messages;

CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();
