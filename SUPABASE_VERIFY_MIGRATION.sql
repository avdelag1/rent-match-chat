-- =============================================================================
-- VERIFICATION QUERIES - Run after each step to confirm success
-- =============================================================================

-- =============================================
-- VERIFY STEP 1: Conversations Schema
-- =============================================

-- 1a. Verify new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'conversations'
AND column_name IN ('client_id', 'owner_id', 'listing_id', 'match_id', 'status')
ORDER BY column_name;
-- EXPECTED: 5 rows with client_id, owner_id NOT NULL

-- 1b. Verify no NULL values in required columns
SELECT COUNT(*) as null_count
FROM public.conversations
WHERE client_id IS NULL OR owner_id IS NULL;
-- EXPECTED: 0

-- 1c. Verify RLS policies exist
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'conversations'
ORDER BY policyname;
-- EXPECTED: 3 policies (view, create, update)

-- =============================================
-- VERIFY STEP 1B: Indexes
-- =============================================

-- 1d. Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'conversations'
AND indexname LIKE 'idx_conversations_%'
ORDER BY indexname;
-- EXPECTED: 5 indexes (client_id, owner_id, listing_id, match_id, unique_pair)

-- 1e. Verify index is VALID (not failed CONCURRENTLY)
SELECT indexrelid::regclass as index_name, indisvalid as is_valid
FROM pg_index
WHERE indexrelid::regclass::text LIKE 'idx_conversations_%';
-- EXPECTED: All show is_valid = true

-- =============================================
-- VERIFY STEP 2: Messages Schema
-- =============================================

-- 2a. Verify both columns exist (backwards compatibility)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'conversation_messages'
AND column_name IN ('content', 'message_text', 'message_type', 'receiver_id')
ORDER BY column_name;
-- EXPECTED: Both 'content' AND 'message_text' exist

-- 2b. Verify data was synced
SELECT COUNT(*) as unsynced_count
FROM public.conversation_messages
WHERE content IS NOT NULL AND message_text IS NULL;
-- EXPECTED: 0

-- 2c. Verify triggers exist
SELECT tgname as trigger_name
FROM pg_trigger
WHERE tgrelid = 'public.conversation_messages'::regclass
AND tgname LIKE 'trigger_%'
ORDER BY tgname;
-- EXPECTED: trigger_auto_populate_receiver_id, trigger_sync_message_content

-- =============================================
-- VERIFY STEP 3: Triggers and Policies
-- =============================================

-- 3a. Verify conversation_messages policies
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'conversation_messages'
ORDER BY policyname;
-- EXPECTED: 2 policies (view, insert)

-- 3b. Verify functions exist
SELECT proname as function_name
FROM pg_proc
WHERE proname IN ('update_conversation_last_message', 'notify_new_message',
                  'auto_populate_receiver_id', 'sync_message_content')
ORDER BY proname;
-- EXPECTED: 4 functions

-- =============================================
-- SECURITY VERIFICATION
-- =============================================

-- 4a. Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'conversation_messages');
-- EXPECTED: Both show rowsecurity = true

-- 4b. Test RLS (run as non-superuser)
-- SET ROLE authenticated;
-- SELECT * FROM conversations LIMIT 1;
-- Should only see own conversations
-- RESET ROLE;
