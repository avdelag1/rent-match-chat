-- Migration: Enhance messaging system with attachments, read receipts, and typing indicators
-- Improves messaging experience with file sharing and real-time presence

-- Add enhancements to conversation_messages table (some fields already exist from core migration)
ALTER TABLE public.conversation_messages
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS attachment_size INTEGER,
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast typing indicator queries
CREATE INDEX IF NOT EXISTS idx_typing_conversation ON public.typing_indicators(conversation_id, is_typing);
CREATE INDEX IF NOT EXISTS idx_typing_user ON public.typing_indicators(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_updated ON public.typing_indicators(updated_at);

-- Enable RLS
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Typing indicators are visible to conversation participants
CREATE POLICY "Conversation participants can view typing indicators"
  ON public.typing_indicators
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = typing_indicators.conversation_id
        AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their own typing status"
  ON public.typing_indicators
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to set typing status
CREATE OR REPLACE FUNCTION public.set_typing_status(
  p_conversation_id UUID,
  p_is_typing BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.typing_indicators (conversation_id, user_id, is_typing)
  VALUES (p_conversation_id, auth.uid(), p_is_typing)
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET
    is_typing = p_is_typing,
    updated_at = NOW();

  -- Auto-cleanup old typing indicators (older than 30 seconds)
  DELETE FROM public.typing_indicators
  WHERE updated_at < NOW() - INTERVAL '30 seconds';
END;
$$;

-- Add unique constraint for typing indicators
CREATE UNIQUE INDEX IF NOT EXISTS idx_typing_user_conversation
  ON public.typing_indicators(conversation_id, user_id);

-- Create message attachments table for multiple attachments per message
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.conversation_messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT,
  thumbnail_url TEXT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_message ON public.message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploader ON public.message_attachments(uploaded_by);

-- Enable RLS
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments in their conversations"
  ON public.message_attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_messages
      WHERE conversation_messages.id = message_attachments.message_id
        AND (conversation_messages.sender_id = auth.uid() OR conversation_messages.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload attachments to their messages"
  ON public.message_attachments
  FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(p_conversation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.conversation_messages
  SET
    is_read = TRUE,
    read_at = NOW()
  WHERE
    conversation_id = p_conversation_id
    AND receiver_id = auth.uid()
    AND is_read = FALSE;
END;
$$;

-- Create function to mark message as delivered
CREATE OR REPLACE FUNCTION public.mark_message_delivered(p_message_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.conversation_messages
  SET
    is_delivered = TRUE,
    delivered_at = NOW()
  WHERE
    id = p_message_id
    AND receiver_id = auth.uid()
    AND is_delivered = FALSE;
END;
$$;

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION public.get_unread_message_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM public.conversation_messages
  WHERE receiver_id = auth.uid() AND is_read = FALSE AND is_deleted = FALSE;

  RETURN unread_count;
END;
$$;

-- Create trigger to send notification on new message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_name TEXT;
  message_preview TEXT;
BEGIN
  -- Get sender name
  SELECT name INTO sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;

  -- Create message preview (first 50 chars)
  message_preview := LEFT(NEW.content, 50);
  IF LENGTH(NEW.content) > 50 THEN
    message_preview := message_preview || '...';
  END IF;

  -- Send notification to receiver
  PERFORM public.send_notification(
    p_user_id := NEW.receiver_id,
    p_type := 'new_message'::public.notification_type,
    p_title := 'New message from ' || sender_name,
    p_message := message_preview,
    p_link_url := '/messages/' || NEW.conversation_id::text,
    p_related_user_id := NEW.sender_id,
    p_metadata := jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'message_id', NEW.id
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.conversation_messages;
CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

-- Update response rate when messages are sent/read
CREATE OR REPLACE FUNCTION public.update_response_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  avg_response_time INTERVAL;
  response_rate_calc NUMERIC;
BEGIN
  -- Calculate average response time for the sender
  SELECT AVG(read_at - created_at)
  INTO avg_response_time
  FROM public.conversation_messages
  WHERE sender_id = NEW.sender_id
    AND is_read = TRUE
    AND read_at IS NOT NULL;

  -- Calculate response rate (% of messages that get a reply)
  SELECT
    (COUNT(*) FILTER (WHERE is_read = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100
  INTO response_rate_calc
  FROM public.conversation_messages
  WHERE sender_id = NEW.sender_id;

  -- Update profile metrics
  UPDATE public.profiles
  SET
    response_time_hours = EXTRACT(EPOCH FROM avg_response_time) / 3600,
    response_rate = response_rate_calc
  WHERE id = NEW.sender_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_response_metrics ON public.conversation_messages;
CREATE TRIGGER trg_update_response_metrics
  AFTER UPDATE OF is_read ON public.conversation_messages
  FOR EACH ROW
  WHEN (NEW.is_read = TRUE AND OLD.is_read = FALSE)
  EXECUTE FUNCTION public.update_response_metrics();

COMMENT ON TABLE public.typing_indicators IS 'Real-time typing indicators for conversations';
COMMENT ON TABLE public.message_attachments IS 'File attachments for messages (documents, images, PDFs)';
COMMENT ON COLUMN public.conversation_messages.is_read IS 'Message read status for read receipts';
COMMENT ON COLUMN public.conversation_messages.is_delivered IS 'Message delivery status';
