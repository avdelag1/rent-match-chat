-- Supabase Lint Warnings - Documentation & Fixes
-- Run in SQL Editor to see documentation

-- ============================================================================
-- AUTH_RLS_INITPLAN WARNINGS (~250+ instances)
-- ============================================================================
-- These warnings indicate RLS policies call auth.uid() for each row, 
-- causing performance issues at scale.
-- 
-- FIX: Replace auth.uid() with (SELECT auth.uid()) in policy definitions
-- Example:
--   OLD: USING (auth.uid() = user_id)
--   NEW: USING ((SELECT auth.uid()) = user_id)
--
-- However, fixing all ~250+ policies is extremely complex and risky.
-- This is a LOW PRIORITY performance issue, not a security issue.


-- ============================================================================
-- MULTIPLE_PERMISSIVE_POLICIES WARNINGS (~100+ instances)
-- ============================================================================
-- These warnings indicate duplicate policies for the same table/role/action.
-- Multiple policies must all be evaluated, causing performance issues.
--
-- Example: likes table has both "Users can view own likes" AND "likes_owner"
-- for anon/authenticated/authenticator/dashboard_user roles
--
-- FIX: Consolidate duplicate policies into single policies with OR conditions
-- Example:
--   OLD: policy1 = "user_id = auth.uid()"
--        policy2 = "user_id = auth.uid()"  
--   NEW: policy = "(user_id = auth.uid())"
--
-- However, this requires analyzing and rewriting ~100+ policies.
-- This is a MEDIUM PRIORITY performance issue, not a security issue.


-- ============================================================================
-- DUPLICATE INDEX WARNINGS (4 instances)
-- ============================================================================
-- These warnings indicate identical indexes on the same table.
-- FIX: Drop duplicate indexes

-- conversation_messages (conversation_messages)
DROP INDEX IF EXISTS idx_messages_conversation_created;

-- likes (likes)
DROP INDEX IF EXISTS ux_likes_user_target;

-- listings (listings)
DROP INDEX IF EXISTS idx_listings_owner;

-- notifications (notifications)
DROP INDEX IF EXISTS idx_notifications_user;


-- ============================================================================
-- VERIFICATION: Check current index count
-- ============================================================================
-- SELECT indexname FROM pg_indexes WHERE tablename = 'conversation_messages';
-- SELECT indexname FROM pg_indexes WHERE tablename = 'likes';
-- SELECT indexname FROM pg_indexes WHERE tablename = 'listings';
-- SELECT indexname FROM pg_indexes WHERE tablename = 'notifications';


-- ============================================================================
-- SUMMARY
-- ============================================================================
-- These lint warnings are mostly PERFORMANCE related, not security issues:
-- 
-- 1. auth_rls_initplan (~250 warnings) - auth.uid() called per row
--    Impact: Minor performance degradation on large tables
--    Priority: LOW
--    Fix: Replace auth.uid() with (SELECT auth.uid())
-- 
-- 2. multiple_permissive_policies (~100 warnings) - duplicate policies
--    Impact: Multiple policy evaluations per query
--    Priority: MEDIUM  
--    Fix: Consolidate policies with OR conditions
-- 
-- 3. duplicate_index (4 warnings) - redundant indexes
--    Impact: Wasted storage, slightly slower writes
--    Priority: LOW
--    Fix: DROP INDEX for duplicates (included above)
--
-- RECOMMENDATION: Focus on duplicate index fixes (included above) and 
-- ignore the RLS performance warnings for now. They don't affect security
-- and fixing them would require extensive testing.
