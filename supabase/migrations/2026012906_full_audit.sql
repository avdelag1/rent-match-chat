-- ============================================
-- COMPLETE DATABASE AUDIT & INTEGRITY CHECK
-- Run this to verify everything is set up correctly
-- ============================================

SELECT '=== DATABASE AUDIT REPORT ===' as message;

-- ============================================
-- 1. CHECK ALL CORE TABLES EXIST
-- ============================================
SELECT '=== 1. CORE TABLES ===' as section;

SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN (
    'profiles', 'listings', 'likes', 'user_roles', 
    'matches', 'conversations', 'messages', 
    'notifications', 'client_filter_preferences',
    'swipes', 'saved_listings', 'subscriptions'
)
ORDER BY table_name;

-- ============================================
-- 2. CHECK LIKES TABLE SCHEMA
-- ============================================
SELECT '=== 2. LIKES TABLE SCHEMA ===' as section;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'likes' 
ORDER BY ordinal_position;

-- Verify required columns exist
SELECT 
    'likes table check' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'likes' AND column_name = 'target_id'
    ) THEN '✅ target_id EXISTS' ELSE '❌ MISSING target_id' END as status
UNION ALL
SELECT 
    'likes table check',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'likes' AND column_name = 'target_type'
    ) THEN '✅ target_type EXISTS' ELSE '❌ MISSING target_type' END
UNION ALL
SELECT 
    'likes table check',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'likes' AND column_name = 'direction'
    ) THEN '✅ direction EXISTS' ELSE '❌ MISSING direction' END;

-- ============================================
-- 3. CHECK RLS POLICIES
-- ============================================
SELECT '=== 3. RLS POLICIES ===' as section;

SELECT tablename, policyname, cmd, CASE WHEN rolname = 'postgres' THEN '✅' ELSE '⚠️' END as is_postgres
FROM pg_policies p
JOIN pg_roles r ON p.role = r.rolname
WHERE tablename IN ('likes', 'profiles', 'listings', 'user_roles')
ORDER BY tablename, policyname;

-- ============================================
-- 4. CHECK RPC FUNCTIONS
-- ============================================
SELECT '=== 4. RPC FUNCTIONS ===' as section;

SELECT 
    'upsert_user_role' as function_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'upsert_user_role'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'handle_new_user',
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END;

-- ============================================
-- 5. CHECK TRIGGERS
-- ============================================
SELECT '=== 5. TRIGGERS ===' as section;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table as table_name,
    CASE WHEN action_order IS NOT NULL THEN '✅' ELSE '❌' END as active
FROM information_schema.triggers
WHERE event_object_table IN ('auth.users', 'profiles')
ORDER BY event_object_table;

-- ============================================
-- 6. CHECK SAMPLE DATA
-- ============================================
SELECT '=== 6. SAMPLE DATA ===' as section;

SELECT 
    'profiles' as table_name,
    COUNT(*) as count,
    CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END as has_data
FROM public.profiles
UNION ALL
SELECT 'listings', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END FROM public.listings
UNION ALL
SELECT 'likes', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END FROM public.likes
UNION ALL
SELECT 'user_roles', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END FROM public.user_roles;

-- ============================================
-- 7. TEST LIKES INSERT (as current user)
-- ============================================
SELECT '=== 7. TEST LIKES INSERT ===' as section;

-- Get current user ID from auth.users
SELECT 
    'Current auth.uid()' as test,
    auth.uid() as user_id,
    CASE WHEN auth.uid() IS NOT NULL THEN '✅ Auth working' ELSE '❌ Auth issue' END as status;

-- Try to insert a test like (if there are listings)
DO $$
DECLARE
    test_listing_id UUID;
    test_user_id UUID := auth.uid();
BEGIN
    -- Find a listing that's not owned by current user
    SELECT id INTO test_listing_id 
    FROM public.listings 
    WHERE status = 'active' 
    AND is_active = true
    AND owner_id != test_user_id
    LIMIT 1;
    
    IF test_listing_id IS NOT NULL AND test_user_id IS NOT NULL THEN
        -- Try to insert
        INSERT INTO public.likes (user_id, target_id, target_type, direction)
        VALUES (test_user_id, test_listing_id, 'listing', 'right')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Test like inserted for listing: %', test_listing_id;
    ELSIF test_user_id IS NULL THEN
        RAISE NOTICE '⚠️ No authenticated user (this is normal in SQL Editor)';
    ELSE
        RAISE NOTICE '⚠️ No listings found to test like';
    END IF;
END $$;

-- ============================================
-- 8. CHECK MATCHES TRIGGER (if it exists)
-- ============================================
SELECT '=== 8. MATCHES TRIGGER ===' as section;

SELECT 
    'Auto-match on mutual like' as feature,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name ILIKE '%match%' 
        AND routine_schema = 'public'
    ) THEN '✅ Function exists' ELSE '❌ MISSING - needs creation' END as status;

-- ============================================
-- 9. CHECK NOTIFICATIONS TRIGGER
-- ============================================
SELECT '=== 9. NOTIFICATIONS TRIGGER ===' as section;

SELECT 
    'Notification on match' as feature,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name ILIKE '%notification%' 
        AND routine_schema = 'public'
    ) THEN '✅ Function exists' ELSE '❌ MISSING - needs creation' END as status;

-- ============================================
-- 10. SUMMARY
-- ============================================
SELECT '=== SUMMARY ===' as message;
SELECT 
    'Core Tables' as category,
    CASE WHEN (
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'likes') > 0 AND
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_roles') > 0
    ) THEN '✅ Complete' ELSE '❌ Incomplete' END as status
UNION ALL
SELECT 'Schema Integrity', 
    CASE WHEN (
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'likes' AND column_name = 'target_id') > 0 AND
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'likes' AND column_name = 'direction') > 0
    ) THEN '✅ Valid' ELSE '❌ Invalid' END
UNION ALL
SELECT 'RLS Policies',
    CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'likes') > 0 THEN '✅ Protected' ELSE '❌ No RLS' END
UNION ALL
SELECT 'Auto Functions',
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
    ) THEN '✅ Auto-create enabled' ELSE '❌ Missing' END;
