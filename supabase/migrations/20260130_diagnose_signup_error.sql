-- ============================================
-- DIAGNOSTIC: Signup Error "Database error saving new user"
-- Date: 2026-01-30
-- ============================================

-- STEP 1: Check email confirmation settings
-- Run in Supabase SQL Editor:

-- A. Check if email confirmation is required
SELECT 
  'Email Confirmation' as setting,
  value as is_required
FROM auth.config
WHERE key = 'enable_email_confirmation';

-- B. Check email confirmation expiry
SELECT 
  'Email Confirm Expiry (seconds)' as setting,
  value as seconds
FROM auth.config
WHERE key = 'email_confirm_expire';

-- C. Check if SMTP is configured
SELECT 
  'SMTP Configured' as setting,
  COUNT(*) > 0 as configured
FROM auth.config
WHERE key LIKE '%smtp%';

-- D. Check external auth providers
SELECT 
  'External OAuth Providers' as setting,
  json_agg(providers) as provider_list
FROM (
  SELECT DISTINCT provider 
  FROM auth.users 
  WHERE app_meta_data IS NOT NULL
) sub;

-- ============================================
-- STEP 2: Check for custom auth hooks
-- ============================================

-- A. Check if there are any triggers on auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- B. Check for custom functions that might be hooked to auth
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND (pg_get_functiondef(oid) LIKE '%auth.users%' 
     OR pg_get_functiondef(oid) LIKE '%auth.uid()%'
     OR proname LIKE '%auth%');

-- ============================================
-- STEP 3: Check profiles table for constraints
-- ============================================

-- A. Check profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- B. Check for foreign key constraints
SELECT 
  constraint_name,
  column_name,
  referenced_table_name,
  referenced_column_name
FROM information_schema.key_column_usage
WHERE table_name = 'profiles';

-- C. Check if there are any invalid foreign keys
SELECT 
  c.constraint_name,
  c.table_name,
  k.column_name,
  c referenced_table_name,
  k.referenced_column_name
FROM information_schema.referential_constraints c
JOIN information_schema.key_column_usage k 
  ON c.constraint_name = k.constraint_name
WHERE c.table_name = 'profiles';

-- ============================================
-- STEP 4: Check for duplicate emails or UUID issues
-- ============================================

-- A. Check if email is unique constraint exists on auth.users
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'users'
AND schemaname = 'auth';

-- B. Check for any users with same email (should fail but let's see)
SELECT 
  email,
  COUNT(*) as count,
  array_agg(id) as user_ids
FROM auth.users
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- ============================================
-- COMMON FIXES
-- ============================================

-- FIX 1: Disable email confirmation (FOR TESTING ONLY)
-- Only use this in development!
-- UPDATE auth.config SET value = 'false' WHERE key = 'enable_email_confirmation';

-- FIX 2: If profiles table has issues, check if profile already exists
-- This can cause conflicts during signup:
-- SELECT id, email FROM public.profiles WHERE id = 'USER_UUID_HERE';

-- FIX 3: Clear any stuck sessions
-- DELETE FROM auth.sessions WHERE user_id = 'USER_UUID_HERE';

-- FIX 4: If using custom hook, disable it temporarily
-- Look for auth-hook in supabase/config.toml or dashboard

-- ============================================
-- RECOMMENDED SOLUTION
-- ============================================

-- The error "Database error saving new user" usually means:
-- 1. Email confirmation is ON but SMTP not configured
-- 2. A trigger on auth.users is failing
-- 3. Foreign key constraint violation in profiles

-- CHECK THESE IN SUPABASE DASHBOARD:
-- 1. Authentication → Providers → Email
--    - Confirm email: should be OFF for testing, or SMTP configured
--    - SMTP Host/Port configured (if confirm email is ON)
--
-- 2. Authentication → Hooks
--    - Check if there's a profile creation hook that's failing
--
-- 3. Database → Logs
--    - Look for actual error message
