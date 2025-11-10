-- Fix conversation_messages table schema to match code expectations
-- The code expects message_text and message_type columns, but the table has content

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

  -- If we have content but not message_text, rename it
  IF has_content_col AND NOT has_message_text_col THEN
    -- Rename content to message_text
    ALTER TABLE public.conversation_messages 
      RENAME COLUMN content TO message_text;

    RAISE NOTICE 'Renamed content column to message_text';
  ELSIF has_message_text_col THEN
    RAISE NOTICE 'conversation_messages table already has message_text column, no migration needed';
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

  -- Make receiver_id nullable since we can derive it from the conversation
  -- In a 1-on-1 conversation, receiver is the other participant
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

-- Create a trigger to auto-populate receiver_id if not provided
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

    -- If we couldn't find a receiver (conversation doesn't exist or sender not in conversation)
    -- raise an error to prevent silent failures
    IF v_receiver_id IS NULL THEN
      RAISE EXCEPTION 'Cannot determine receiver_id: sender % is not a participant in conversation %', 
        NEW.sender_id, NEW.conversation_id;
    END IF;
    
    NEW.receiver_id := v_receiver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS trigger_auto_populate_receiver_id ON public.conversation_messages;
CREATE TRIGGER trigger_auto_populate_receiver_id
  BEFORE INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_receiver_id();
