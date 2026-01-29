-- Supabase Function Security Fixes
-- Fixes: function_search_path_mutable warnings
-- Run in SQL Editor

-- ============================================================================
-- Helper: Create a wrapper to safely alter functions with search_path
-- ============================================================================
DO $$
DECLARE
  func RECORD;
BEGIN
  -- List of functions that need search_path fixed
  FOR func IN 
    SELECT proname, oidvectortypes(proargnames) as argtypes
    FROM pg_proc 
    WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND proname IN (
      'update_modified_column', 'update_updated_at_column', 'update_swipe_analytics',
      'auto_populate_receiver_for_messages', 'sync_client_age_to_profiles', 'is_row_active',
      'sync_message_content', 'log_recommendation_interaction', 'search_listings',
      'get_swipe_feed', 'create_match_on_mutual_like', 'create_match_on_like',
      'update_conversation_last_message', 'create_match_if_mutual', 'current_auth_uid',
      'set_user_on_insert', 'manage_property_availability', 'calculate_match_score',
      'set_created_at', 'archive_inactive_conversations', 'cleanup_old_swipes',
      'flag_stale_listings', 'get_platform_statistics', 'notify_listing_owner_on_like',
      'notify_client_on_owner_like', 'notify_message_receiver', 'check_message_activation_required',
      'owner_likes_listing_likes_trigger', 'prevent_self_like', 'create_match_if_not_exists',
      'likes_after_insert_match_trigger', 'owner_likes_after_insert_match_trigger',
      'auto_populate_receiver_id', 'hook_create_profile_on_signup', 'current_window_start',
      'notify_new_message', 'check_and_increment_rate_limit', 'upsert_toggle_owner_like',
      'owner_likes_broadcast_trigger', 'handle_new_user'
    )
  LOOP
    -- Execute ALTER FUNCTION for each function
    EXECUTE format('ALTER FUNCTION public.%I SET search_path = ''pg_catalog'', ''public''', func.proname);
  END LOOP;
END $$;

-- ============================================================================
-- Alternative: Manual ALTER for each function (more reliable)
-- ============================================================================
-- Uncomment and run individually if the DO block above doesn't work

-- ALTER FUNCTION public.update_modified_column SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.update_updated_at_column SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.update_swipe_analytics SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.auto_populate_receiver_for_messages SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.sync_client_age_to_profiles SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.is_row_active SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.sync_message_content SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.log_recommendation_interaction SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.search_listings SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.get_swipe_feed SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.create_match_on_mutual_like SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.create_match_on_like SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.update_conversation_last_message SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.create_match_if_mutual SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.current_auth_uid SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.set_user_on_insert SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.manage_property_availability SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.calculate_match_score SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.set_created_at SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.archive_inactive_conversations SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.cleanup_old_swipes SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.flag_stale_listings SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.get_platform_statistics SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.notify_listing_owner_on_like SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.notify_client_on_owner_like SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.notify_message_receiver SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.check_message_activation_required SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.owner_likes_listing_likes_trigger SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.prevent_self_like SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.create_match_if_not_exists SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.likes_after_insert_match_trigger SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.owner_likes_after_insert_match_trigger SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.auto_populate_receiver_id SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.hook_create_profile_on_signup SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.current_window_start SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.notify_new_message SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.check_and_increment_rate_limit SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.upsert_toggle_owner_like SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.owner_likes_broadcast_trigger SET search_path = 'pg_catalog', 'public';
-- ALTER FUNCTION public.handle_new_user SET search_path = 'pg_catalog', 'public';


-- ============================================================================
-- NOTES ON OTHER WARNINGS (Cannot fix or should not fix):
-- ============================================================================

-- 1. extension_in_public (postgis) - WARNING ONLY
-- PostGIS MUST be in public schema to work. This is safe and intentional.
-- Do NOT try to move it.

-- 2. auth_leaked_password_protection - Enable in Supabase Dashboard
-- Go to: Authentication -> Providers -> Email -> Enable "Enable leaked password protection"
-- Or use: 
-- UPDATE auth.config SET enable_leaked_password_protection = true;

-- 3. vulnerable_postgres_version - Upgrade in Supabase Dashboard
-- Go to: Settings -> Database -> Upgrade available
-- This requires downtime and should be done during maintenance window.


-- ============================================================================
-- Verification Query
-- ============================================================================
-- SELECT 
--   proname as function_name,
--   pg_get_functiondef(oid) as definition
-- FROM pg_proc 
-- WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
-- AND proname IN (
--   'update_modified_column', 'update_updated_at_column', 'update_swipe_analytics',
--   'auto_populate_receiver_for_messages', 'sync_client_age_to_profiles', 'is_row_active'
-- )
-- AND pg_get_functiondef(oid) LIKE '%search_path%';
