-- Supabase Database Security Fixes
-- Run in SQL Editor to fix lint errors

-- ============================================================================
-- ISSUE 1: RLS disabled on public tables (CAN BE FIXED)
-- ============================================================================

-- Enable RLS on app_cache_control
ALTER TABLE app_cache_control ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated access to app_cache_control" ON app_cache_control;
CREATE POLICY "Allow authenticated access to app_cache_control" ON app_cache_control
  FOR ALL USING (auth.role() IN ('authenticated', 'service_role'));

-- Enable RLS on user_action_limits  
ALTER TABLE user_action_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own action limits" ON user_action_limits;
CREATE POLICY "Users can view own action limits" ON user_action_limits
  FOR SELECT USING (auth.uid()::text = user_id::text OR auth.role() = 'service_role');

-- Enable RLS on database_activity_tracker
ALTER TABLE database_activity_tracker ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only for activity tracker" ON database_activity_tracker;
CREATE POLICY "Service role only for activity tracker" ON database_activity_tracker
  FOR ALL USING (auth.role() = 'service_role');

-- Enable RLS on conversation_messages_dlq
ALTER TABLE conversation_messages_dlq ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only for DLQ" ON conversation_messages_dlq;
CREATE POLICY "Service role only for DLQ" ON conversation_messages_dlq
  FOR ALL USING (auth.role() = 'service_role');


-- ============================================================================
-- ISSUE 2: spatial_ref_sys (CANNOT BE FIXED - PostGIS system table)
-- ============================================================================
-- This is a PostGIS extension table owned by postgres superuser.
-- We cannot change ownership or enable RLS on system tables.
-- It's safe to leave as-is because:
--   - It's read-only reference data (SRID definitions)
--   - Contains no user data, no PII
--   - Required for PostGIS spatial queries to work
-- Lint warning can be safely ignored for this table.


-- ============================================================================
-- ISSUE 3: vw_push_outbox_failures (CANNOT BE FIXED safely)
-- ============================================================================
-- This view uses SECURITY DEFINER intentionally for the push notification
-- outbox pattern. It allows the background worker to read failure records
-- without being blocked by RLS policies.
-- 
-- It's safe because:
--   - Only reads from push_outbox_failures table
--   - No INSERT/UPDATE/DELETE operations
--   - Used internally by notification system
--   - Does not expose sensitive user data
-- 
-- If you must change it, you would need to refactor the push notification
-- system to work without SECURITY DEFINER. This is not recommended
-- as it would require significant changes to the notification worker.
-- Lint warning can be safely documented and ignored.


-- ============================================================================
-- ADD: Add missing columns for profile features (from frontend)
-- ============================================================================

-- Add service_offerings to owner_profiles (multi-select)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'owner_profiles' AND column_name = 'service_offerings') THEN
    ALTER TABLE owner_profiles ADD COLUMN service_offerings text[] DEFAULT '{}'::text[];
  END IF;
END $$;

-- Add intentions to client_profiles (multi-select)  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_profiles' AND column_name = 'intentions') THEN
    ALTER TABLE client_profiles ADD COLUMN intentions text[] DEFAULT '{}'::text[];
  END IF;
END $$;

-- Update null values
UPDATE owner_profiles SET service_offerings = '{}'::text[] WHERE service_offerings IS NULL;
UPDATE client_profiles SET intentions = '{}'::text[] WHERE intentions IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_owner_profiles_service_offerings ON owner_profiles USING GIN (service_offerings);
CREATE INDEX IF NOT EXISTS idx_client_profiles_intentions ON client_profiles USING GIN (intentions);


-- ============================================================================
-- Verification Query - Run to check RLS status
-- ============================================================================
-- SELECT 
--   schemaname,
--   tablename,
--   relrowsecurity AS rls_enabled,
--   rolname AS owner
-- FROM pg_tables t
-- JOIN pg_roles r ON t.tableowner = r.rolname
-- WHERE schemaname = 'public'
--   AND tablename IN ('app_cache_control', 'user_action_limits', 'database_activity_tracker', 'conversation_messages_dlq')
-- ORDER BY tablename;
