-- =============================================================================
-- COMPREHENSIVE SUPABASE BACKEND AUDIT
-- =============================================================================
-- Run this in Supabase Dashboard > SQL Editor to verify your database state
-- This script will identify:
--   1. Tables missing RLS
--   2. Tables with incomplete policies
--   3. Missing indexes for performance
--   4. Rating system deployment status
--   5. Security gaps
--
-- Expected result: All sections should show GREEN/PASS status
-- =============================================================================

-- ============================================
-- SECTION 1: RLS ENFORCEMENT STATUS
-- ============================================
-- List all tables and their RLS status
-- CRITICAL: All public tables should have RLS enabled

SELECT '=== SECTION 1: RLS ENFORCEMENT STATUS ===' as audit_section;

SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED - SECURITY RISK!' END as rls_status,
  CASE WHEN rowsecurity THEN 'PASS' ELSE 'FAIL' END as audit_result
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
AND tablename NOT LIKE 'schema_%'
ORDER BY rowsecurity ASC, tablename;

-- ============================================
-- SECTION 2: RLS POLICY COMPLETENESS
-- ============================================
-- For each critical table, verify all required policy types exist
-- Every table should have SELECT, INSERT, UPDATE, DELETE policies

SELECT '=== SECTION 2: RLS POLICY COMPLETENESS ===' as audit_section;

WITH critical_tables AS (
  SELECT unnest(ARRAY[
    'profiles',
    'listings',
    'conversations',
    'conversation_messages',
    'swipes',
    'matches',
    'likes',
    'notifications',
    'user_roles'
  ]) as table_name
),
policy_coverage AS (
  SELECT
    ct.table_name,
    COUNT(DISTINCT CASE WHEN pp.cmd = 'r' THEN 1 END) as has_select,
    COUNT(DISTINCT CASE WHEN pp.cmd = 'a' THEN 1 END) as has_insert,
    COUNT(DISTINCT CASE WHEN pp.cmd = 'w' THEN 1 END) as has_update,
    COUNT(DISTINCT CASE WHEN pp.cmd = 'd' THEN 1 END) as has_delete,
    COUNT(*) as total_policies
  FROM critical_tables ct
  LEFT JOIN pg_policies pp ON pp.tablename = ct.table_name
  GROUP BY ct.table_name
)
SELECT
  table_name,
  total_policies || ' policies' as policy_count,
  CASE WHEN has_select > 0 THEN '✅' ELSE '❌' END as "SELECT",
  CASE WHEN has_insert > 0 THEN '✅' ELSE '❌' END as "INSERT",
  CASE WHEN has_update > 0 THEN '✅' ELSE '❌' END as "UPDATE",
  CASE WHEN has_delete > 0 THEN '✅' ELSE '⚠️' END as "DELETE",
  CASE
    WHEN has_select > 0 AND has_insert > 0 AND has_update > 0 THEN 'ADEQUATE'
    WHEN has_select = 0 THEN 'CRITICAL: No SELECT policy'
    WHEN has_insert = 0 THEN 'WARNING: No INSERT policy'
    ELSE 'REVIEW NEEDED'
  END as status
FROM policy_coverage
ORDER BY total_policies ASC, table_name;

-- ============================================
-- SECTION 3: DETAILED POLICY LISTING
-- ============================================
-- Show all RLS policies with their conditions

SELECT '=== SECTION 3: DETAILED POLICY LISTING ===' as audit_section;

SELECT
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    ELSE cmd
  END as operation,
  permissive as is_permissive,
  CASE
    WHEN qual LIKE '%true%' AND qual NOT LIKE '%auth.uid()%' THEN '⚠️ WARNING: Too permissive'
    WHEN qual LIKE '%auth.uid()%' THEN '✅ User-scoped'
    ELSE '⚠️ Review needed'
  END as security_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================
-- SECTION 4: DANGEROUS POLICIES (Security Audit)
-- ============================================
-- Find policies that might be too permissive

SELECT '=== SECTION 4: DANGEROUS POLICIES ===' as audit_section;

SELECT
  tablename,
  policyname,
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    ELSE cmd
  END as operation,
  qual as policy_condition,
  '❌ REVIEW THIS - Potentially allows access without proper user verification' as warning
FROM pg_policies
WHERE schemaname = 'public'
AND (
  -- Policies that just use 'true'
  qual = 'true'
  -- Or policies that allow all authenticated users
  OR (qual LIKE '%role() =%' AND qual NOT LIKE '%auth.uid()%')
)
AND cmd != 'r' -- SELECT with 'true' might be intentional for public data
ORDER BY tablename, policyname;

-- ============================================
-- SECTION 5: INDEX STATUS FOR CRITICAL QUERIES
-- ============================================
-- Verify indexes exist for common query patterns

SELECT '=== SECTION 5: INDEX STATUS ===' as audit_section;

WITH expected_indexes AS (
  SELECT unnest(ARRAY[
    -- Conversations
    'idx_conversations_client_id',
    'idx_conversations_owner_id',
    'idx_conversations_listing_id',
    -- Messages
    'idx_conversation_messages_conversation_id',
    'idx_conversation_messages_sender_id',
    -- Swipes
    'idx_swipes_user_id',
    'idx_swipes_target_id',
    -- Listings
    'idx_listings_user_id',
    'idx_listings_category',
    'idx_listings_status',
    -- Profiles
    'idx_profiles_user_id',
    -- Likes
    'idx_likes_user_id',
    'idx_likes_target_id'
  ]) as expected_index
),
existing_indexes AS (
  SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
)
SELECT
  ei.expected_index,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM existing_indexes
      WHERE indexname LIKE '%' || split_part(ei.expected_index, 'idx_', 2) || '%'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM expected_indexes ei
ORDER BY status DESC, expected_index;

-- ============================================
-- SECTION 6: RATING SYSTEM DEPLOYMENT STATUS
-- ============================================
-- Check if the comprehensive rating system has been deployed

SELECT '=== SECTION 6: RATING SYSTEM STATUS ===' as audit_section;

SELECT
  'rating_categories' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rating_categories') THEN '✅ EXISTS' ELSE '❌ NOT DEPLOYED' END as status
UNION ALL
SELECT
  'ratings' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ratings') THEN '✅ EXISTS' ELSE '❌ NOT DEPLOYED' END as status
UNION ALL
SELECT
  'rating_aggregates' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rating_aggregates') THEN '✅ EXISTS' ELSE '❌ NOT DEPLOYED' END as status
UNION ALL
SELECT
  'calculate_rating_decay function' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_rating_decay') THEN '✅ EXISTS' ELSE '❌ NOT DEPLOYED' END as status
UNION ALL
SELECT
  'recalculate_rating_aggregate function' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'recalculate_rating_aggregate') THEN '✅ EXISTS' ELSE '❌ NOT DEPLOYED' END as status;

-- ============================================
-- SECTION 7: CONVERSATION & MESSAGING SCHEMA
-- ============================================
-- Verify the messaging system is properly configured

SELECT '=== SECTION 7: MESSAGING SCHEMA STATUS ===' as audit_section;

SELECT
  column_name,
  data_type,
  is_nullable,
  CASE
    WHEN column_name IN ('client_id', 'owner_id') AND is_nullable = 'NO' THEN '✅ Required'
    WHEN column_name IN ('client_id', 'owner_id') AND is_nullable = 'YES' THEN '⚠️ Should be NOT NULL'
    ELSE '✅ OK'
  END as validation
FROM information_schema.columns
WHERE table_name = 'conversations'
AND column_name IN ('client_id', 'owner_id', 'listing_id', 'match_id', 'status')
ORDER BY ordinal_position;

-- Verify conversation_messages has required columns
SELECT
  column_name,
  data_type,
  '✅ EXISTS' as status
FROM information_schema.columns
WHERE table_name = 'conversation_messages'
AND column_name IN ('conversation_id', 'sender_id', 'receiver_id', 'message_text', 'content', 'is_read')
ORDER BY ordinal_position;

-- ============================================
-- SECTION 8: TRIGGER STATUS
-- ============================================
-- Verify critical triggers are in place

SELECT '=== SECTION 8: TRIGGER STATUS ===' as audit_section;

SELECT
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE tgenabled
    WHEN 'O' THEN '✅ ENABLED'
    WHEN 'D' THEN '❌ DISABLED'
    ELSE '⚠️ UNKNOWN'
  END as status
FROM pg_trigger
WHERE tgname NOT LIKE 'RI_%' -- Skip referential integrity triggers
AND tgrelid::regclass::text IN (
  'public.conversations',
  'public.conversation_messages',
  'public.ratings',
  'public.profiles',
  'public.listings'
)
ORDER BY tgrelid::regclass::text, tgname;

-- ============================================
-- SECTION 9: SUMMARY & ACTIONS NEEDED
-- ============================================

SELECT '=== SECTION 9: SUMMARY ===' as audit_section;

SELECT 'ACTION ITEMS:' as summary;

-- Count tables without RLS
SELECT
  'Tables without RLS: ' || COUNT(*)::text || ' (should be 0)' as action_item
FROM pg_tables
WHERE schemaname = 'public'
AND NOT rowsecurity
AND tablename NOT LIKE 'pg_%'
AND tablename NOT LIKE 'schema_%';

-- Count tables without policies
SELECT
  'Tables with no policies: Check Section 2 results' as action_item;

-- Rating system status
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ratings')
    THEN '✅ Rating system is deployed'
    ELSE '❌ Run 20260124_comprehensive_rating_system.sql to deploy rating system'
  END as action_item;

-- ============================================
-- END OF AUDIT
-- ============================================
SELECT '=== AUDIT COMPLETE ===' as audit_section;
SELECT 'Review all ❌ and ⚠️ items above. Green (✅) items are secure.' as final_note;
