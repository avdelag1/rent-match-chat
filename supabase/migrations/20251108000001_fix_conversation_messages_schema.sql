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
END $$;

-- Ensure receiver_id can be nullable (in group chats or broadcasts)
-- Actually for 1-on-1 it should stay NOT NULL, so let's keep it as is

-- Update RLS policies if needed (they should already be correct)
-- The existing policies check sender_id OR receiver_id which is correct
