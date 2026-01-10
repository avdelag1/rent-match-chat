-- =============================================================================
-- STEP 2: Fix conversation_messages table schema (SAFE VERSION)
-- IMPORTANT: Does NOT rename 'content' column - adds 'message_text' alongside
-- =============================================================================

DO $$
DECLARE
  has_content_col BOOLEAN;
  has_message_text_col BOOLEAN;
BEGIN
  -- Check if content column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_messages'
    AND column_name = 'content'
  ) INTO has_content_col;

  -- Check if message_text column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_messages'
    AND column_name = 'message_text'
  ) INTO has_message_text_col;

  -- SAFE APPROACH: Add message_text column WITHOUT renaming content
  -- This maintains backwards compatibility with existing code
  IF has_content_col AND NOT has_message_text_col THEN
    -- Add new column (does not break existing code using 'content')
    ALTER TABLE public.conversation_messages
      ADD COLUMN message_text TEXT;

    -- Copy existing data from content to message_text
    UPDATE public.conversation_messages
    SET message_text = content
    WHERE message_text IS NULL AND content IS NOT NULL;

    RAISE NOTICE 'Added message_text column and copied data from content';
  ELSIF has_message_text_col THEN
    RAISE NOTICE 'Already has message_text column';
  END IF;

  -- Add message_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_messages'
    AND column_name = 'message_type'
  ) THEN
    ALTER TABLE public.conversation_messages
      ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system'));
    RAISE NOTICE 'Added message_type column';
  END IF;

  -- Make receiver_id nullable since we can derive it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversation_messages'
    AND column_name = 'receiver_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.conversation_messages
      ALTER COLUMN receiver_id DROP NOT NULL;
    RAISE NOTICE 'Made receiver_id nullable';
  END IF;
END $$;

-- Create trigger to sync content <-> message_text for backwards compatibility
-- This ensures both columns stay in sync during transition period
CREATE OR REPLACE FUNCTION sync_message_content()
RETURNS TRIGGER AS $$
BEGIN
  -- If message_text is set but content is not, copy to content
  IF NEW.message_text IS NOT NULL AND NEW.content IS NULL THEN
    NEW.content := NEW.message_text;
  -- If content is set but message_text is not, copy to message_text
  ELSIF NEW.content IS NOT NULL AND NEW.message_text IS NULL THEN
    NEW.message_text := NEW.content;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_message_content ON public.conversation_messages;
CREATE TRIGGER trigger_sync_message_content
  BEFORE INSERT OR UPDATE ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION sync_message_content();

-- Create trigger to auto-populate receiver_id
CREATE OR REPLACE FUNCTION auto_populate_receiver_id()
RETURNS TRIGGER AS $$
DECLARE
  v_receiver_id UUID;
BEGIN
  -- Only auto-populate if receiver_id is NULL
  IF NEW.receiver_id IS NULL THEN
    -- Get the other participant from the conversation
    SELECT CASE
      WHEN c.client_id = NEW.sender_id THEN c.owner_id
      WHEN c.owner_id = NEW.sender_id THEN c.client_id
      ELSE NULL
    END INTO v_receiver_id
    FROM public.conversations c
    WHERE c.id = NEW.conversation_id;

    -- If we couldn't find a receiver, raise an error
    IF v_receiver_id IS NULL THEN
      RAISE EXCEPTION 'Cannot determine receiver_id: sender % is not a participant in conversation %',
        NEW.sender_id, NEW.conversation_id;
    END IF;

    NEW.receiver_id := v_receiver_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_populate_receiver_id ON public.conversation_messages;
CREATE TRIGGER trigger_auto_populate_receiver_id
  BEFORE INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_receiver_id();
