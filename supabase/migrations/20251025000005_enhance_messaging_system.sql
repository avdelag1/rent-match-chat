-- Migration: Enhance messaging system with attachments, read receipts, and typing indicators
-- Improves messaging experience with file sharing and real-time presence

-- Check if messages table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN

    -- Add message enhancements
    ALTER TABLE public.messages
      ADD COLUMN IF NOT EXISTS has_attachment BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS attachment_url TEXT,
      ADD COLUMN IF NOT EXISTS attachment_type TEXT CHECK (attachment_type IN ('image', 'pdf', 'document', 'other')),
      ADD COLUMN IF NOT EXISTS attachment_name TEXT,
      ADD COLUMN IF NOT EXISTS attachment_size INTEGER,
      ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

    -- Create indexes for messaging queries
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(receiver_id, is_read) WHERE is_read = FALSE;
    CREATE INDEX IF NOT EXISTS idx_messages_attachments ON public.messages(conversation_id) WHERE has_attachment = TRUE;

    RAISE NOTICE 'Messages table enhanced successfully';
  ELSE
    RAISE NOTICE 'Messages table does not exist, skipping message enhancements';
  END IF;
END $$;

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
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
      SELECT 1 FROM public.messages
      WHERE messages.conversation_id = typing_indicators.conversation_id
        AND (messages.sender_id = auth.uid() OR messages.receiver_id = auth.uid())
      LIMIT 1
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
  message_id UUID NOT NULL,
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
      SELECT 1 FROM public.messages
      WHERE messages.id = message_attachments.message_id
        AND (messages.sender_id = auth.uid() OR messages.receiver_id = auth.uid())
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
  UPDATE public.messages
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
  UPDATE public.messages
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
  FROM public.messages
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

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
    DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
    CREATE TRIGGER trg_notify_new_message
      AFTER INSERT ON public.messages
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_new_message();
  END IF;
END $$;

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
  FROM public.messages
  WHERE sender_id = NEW.sender_id
    AND is_read = TRUE
    AND read_at IS NOT NULL;

  -- Calculate response rate (% of messages that get a reply)
  SELECT
    (COUNT(*) FILTER (WHERE is_read = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100
  INTO response_rate_calc
  FROM public.messages
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

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
    DROP TRIGGER IF EXISTS trg_update_response_metrics ON public.messages;
    CREATE TRIGGER trg_update_response_metrics
      AFTER UPDATE OF is_read ON public.messages
      FOR EACH ROW
      WHEN (NEW.is_read = TRUE AND OLD.is_read = FALSE)
      EXECUTE FUNCTION public.update_response_metrics();
  END IF;
END $$;

COMMENT ON TABLE public.typing_indicators IS 'Real-time typing indicators for conversations';
COMMENT ON TABLE public.message_attachments IS 'File attachments for messages (documents, images, PDFs)';
COMMENT ON COLUMN public.messages.is_read IS 'Message read status for read receipts';
COMMENT ON COLUMN public.messages.is_delivered IS 'Message delivery status';
