-- VERIFICATION: Check if conversation_messages table has message_text and message_type columns
SELECT column_name FROM information_schema.columns
WHERE table_name='conversation_messages' AND column_name IN ('message_text', 'message_type')
ORDER BY column_name;
