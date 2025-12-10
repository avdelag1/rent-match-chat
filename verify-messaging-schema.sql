-- Verification script to check if messaging schema is correct
-- Run this in your Supabase SQL editor to verify the database state

-- 1. Check conversation_messages table columns
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'conversation_messages'
  AND column_name IN ('message_text', 'content', 'message_type', 'receiver_id')
ORDER BY column_name;

-- Expected output should show:
-- message_text (TEXT, YES or NO)
-- message_type (TEXT, YES or NO)
-- receiver_id (UUID, YES) -- should be nullable

-- 2. Check conversations table columns
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('client_id', 'owner_id', 'participant_1_id', 'participant_2_id')
ORDER BY column_name;

-- Expected output should show:
-- client_id (UUID, NO)
-- owner_id (UUID, NO)

-- 3. Check if the receiver_id auto-populate trigger exists
SELECT
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'conversation_messages'
  AND trigger_name = 'trigger_auto_populate_receiver_id';

-- Expected: Should return one row showing the trigger exists

-- 4. Check RLS policies on conversation_messages
SELECT
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'conversation_messages'
ORDER BY policyname;

-- 5. Test a sample query to see if it works
-- (Replace with actual conversation_id from your database)
-- SELECT id, sender_id, message_text, message_type, created_at
-- FROM conversation_messages
-- WHERE conversation_id = 'your-test-conversation-id'
-- LIMIT 1;
