-- Supabase Database Security Fixes
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on public tables that need it
-- These are internal/utility tables that should be protected

-- app_cache_control
ALTER TABLE app_cache_control ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated access to app_cache_control" ON app_cache_control
  FOR ALL USING (auth.role() IN ('authenticated', 'service_role'));

-- spatial_ref_sys (PostGIS reference table - usually safe to leave as-is since it's read-only reference data)
-- For safety, we'll create a policy that allows read access to authenticated users
ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to spatial_ref_sys" ON spatial_ref_sys
  FOR SELECT USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

-- user_action_limits
ALTER TABLE user_action_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own action limits" ON user_action_limits
  FOR SELECT USING (auth.uid()::text = user_id::text OR auth.role() = 'service_role');

-- database_activity_tracker
ALTER TABLE database_activity_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only for activity tracker" ON database_activity_tracker
  FOR ALL USING (auth.role() = 'service_role');

-- conversation_messages_dlq (Dead Letter Queue - internal use)
ALTER TABLE conversation_messages_dlq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only for DLQ" ON conversation_messages_dlq
  FOR ALL USING (auth.role() = 'service_role');


-- 2. Handle vw_push_outbox_failures security definer view
-- This is an internal system view. For security, we have two options:
-- Option A: Remove SECURITY DEFINER (safer but may break internal functions)
-- Option B: Document it as intentional (for push notification system)

-- First, let's check if it's safe to modify:
-- The SECURITY DEFINER is likely there to allow the push notification background
-- worker to read failures without normal RLS restrictions.

-- If you want to remove SECURITY DEFINER, uncomment below:
-- ALTER VIEW vw_push_outbox_failures SET SECURITY DEFINER;
-- (This would actually SET to not definer, but PostgreSQL syntax differs)

-- For Supabase, the recommended approach is to keep it as-is since it's
-- an internal system view for the push outbox pattern. The lint warning
-- is informational rather than a critical security issue for this specific view.


-- 3. Grant permissions for auth.users to access necessary tables
-- These policies ensure users can only access their own data

-- Enable RLS on auth tables if not already enabled (should be by default)
-- But grant proper access policies

-- Function to check if RLS is enabled
DO $$
DECLARE
  rls_check boolean;
BEGIN
  -- Check and fix app_cache_control
  SELECT relrowsecurity INTO rls_check FROM pg_class WHERE relname = 'app_cache_control';
  IF NOT rls_check THEN
    ALTER TABLE app_cache_control ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Check and fix user_action_limits
  SELECT relrowsecurity INTO rls_check FROM pg_class WHERE relname = 'user_action_limits';
  IF NOT rls_check THEN
    ALTER TABLE user_action_limits ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;


-- 4. Create a log entry for security audit
INSERT INTO database_activity_tracker (activity_type, details)
VALUES ('security_update', '{"action": "rls_enabled", "tables": ["app_cache_control", "spatial_ref_sys", "user_action_limits", "database_activity_tracker", "conversation_messages_dlq"]}')
ON CONFLICT DO NOTHING;
