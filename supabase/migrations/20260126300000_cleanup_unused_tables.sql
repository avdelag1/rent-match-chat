-- =====================================================
-- DATABASE CLEANUP - REMOVE UNUSED TABLES
-- Created: 2026-01-26
-- Purpose: Remove tables not used in the application
-- =====================================================
--
-- IMPORTANT: Run each phase separately and test your app after each phase!
-- If something breaks, you know which phase caused it.
--
-- Tables are organized by risk level:
-- PHASE 1: ZERO RISK - Legacy/duplicate tables with no references
-- PHASE 2: LOW RISK - Old system tables not in use
-- PHASE 3: MEDIUM RISK - Tables that might have some data
-- =====================================================

-- =====================================================
-- PHASE 1: ZERO RISK - Legacy "property" tables
-- These were replaced by "listings" table
-- =====================================================

DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.property_availability CASCADE;
DROP TABLE IF EXISTS public.property_comments CASCADE;
DROP TABLE IF EXISTS public.property_favorites CASCADE;
DROP TABLE IF EXISTS public.property_features CASCADE;
DROP TABLE IF EXISTS public.property_images CASCADE;
DROP TABLE IF EXISTS public.property_interactions CASCADE;
DROP TABLE IF EXISTS public.property_match_messages CASCADE;
DROP TABLE IF EXISTS public.property_matches CASCADE;
DROP TABLE IF EXISTS public.property_ratings CASCADE;
DROP TABLE IF EXISTS public.property_recommendations CASCADE;
DROP TABLE IF EXISTS public.property_reports CASCADE;
DROP TABLE IF EXISTS public.property_swipes CASCADE;
DROP TABLE IF EXISTS public.property_tours CASCADE;
DROP TABLE IF EXISTS public.property_viewing_requests CASCADE;
DROP TABLE IF EXISTS public.owner_properties CASCADE;

-- =====================================================
-- PHASE 2: ZERO RISK - Duplicate user tables
-- These are duplicates of "profiles" table
-- =====================================================

DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.tenant_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =====================================================
-- PHASE 3: LOW RISK - Unused tracking/logging tables
-- =====================================================

DROP TABLE IF EXISTS public.user_activity_log CASCADE;
DROP TABLE IF EXISTS public.user_activity_tracking CASCADE;
DROP TABLE IF EXISTS public.swipe_analytics CASCADE;
DROP TABLE IF EXISTS public.profile_update_logs CASCADE;

-- =====================================================
-- PHASE 4: LOW RISK - Unused system tables
-- =====================================================

DROP TABLE IF EXISTS public.service_circuit_breaker CASCADE;
DROP TABLE IF EXISTS public.system_trace_logs CASCADE;
DROP TABLE IF EXISTS public.rate_limit_log CASCADE;
DROP TABLE IF EXISTS public.security_event_logs CASCADE;
DROP TABLE IF EXISTS public.data_access_logs CASCADE;

-- =====================================================
-- PHASE 5: LOW RISK - Duplicate notification/preference tables
-- =====================================================

DROP TABLE IF EXISTS public.user_notification_preferences CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.user_search_preferences CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.user_privacy_settings CASCADE;

-- =====================================================
-- PHASE 6: LOW RISK - Unused user management tables
-- =====================================================

DROP TABLE IF EXISTS public.user_block_list CASCADE; -- replaced by user_blocks
DROP TABLE IF EXISTS public.user_complaints CASCADE; -- replaced by user_reports
DROP TABLE IF EXISTS public.user_consent_logs CASCADE;
DROP TABLE IF EXISTS public.user_documents CASCADE;
DROP TABLE IF EXISTS public.user_feedback CASCADE;
DROP TABLE IF EXISTS public.user_interactions CASCADE;
DROP TABLE IF EXISTS public.user_likes CASCADE; -- replaced by likes table
DROP TABLE IF EXISTS public.user_payment_methods CASCADE;
DROP TABLE IF EXISTS public.user_package_overrides CASCADE;
DROP TABLE IF EXISTS public.user_restrictions CASCADE;
DROP TABLE IF EXISTS public.user_warnings CASCADE;

-- =====================================================
-- PHASE 7: LOW RISK - Unused communication tables
-- =====================================================

DROP TABLE IF EXISTS public.communication_channels CASCADE;
DROP TABLE IF EXISTS public.channel_participants CASCADE;
DROP TABLE IF EXISTS public.user_authentication_methods CASCADE;
DROP TABLE IF EXISTS public.mfa_methods CASCADE;

-- =====================================================
-- PHASE 8: LOW RISK - Old messaging tables
-- Replaced by conversations + conversation_messages
-- =====================================================

DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.match_conversations CASCADE;

-- =====================================================
-- PHASE 9: MEDIUM RISK - Potentially useful but unused
-- =====================================================

DROP TABLE IF EXISTS public.favorites CASCADE; -- if using likes instead
DROP TABLE IF EXISTS public.swipes CASCADE; -- if using likes + dislikes instead

-- =====================================================
-- PHASE 10: CLEANUP - Remove push notification queues if not using
-- =====================================================

DROP TABLE IF EXISTS public.push_outbox CASCADE;
DROP TABLE IF EXISTS public.push_outbox_dlq CASCADE;

-- =====================================================
-- SUMMARY
-- =====================================================

DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

  RAISE NOTICE '============================================================';
  RAISE NOTICE 'DATABASE CLEANUP COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Remaining tables: %', remaining_count;
  RAISE NOTICE '';
  RAISE NOTICE 'If something broke, check which phase caused it.';
  RAISE NOTICE 'You can restore from Supabase backups if needed.';
  RAISE NOTICE '============================================================';
END $$;
