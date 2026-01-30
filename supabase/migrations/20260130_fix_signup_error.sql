-- ============================================
-- FIX: "Database error saving new user"
-- Date: 2026-01-30
-- ============================================

-- This script fixes common causes of signup failures in Supabase

-- ============================================
-- FIX 1: Disable email confirmation (quick fix for development)
-- ============================================
-- If email confirmation is ON and SMTP is not configured, signup fails.
-- This disables email confirmation so users can sign up immediately.

-- Check current value first
SELECT key, value FROM auth.config WHERE key = 'enable_email_confirmation';

-- Disable email confirmation (run this if above shows 'true')
-- UPDATE auth.config SET value = 'false' WHERE key = 'enable_email_confirmation';

-- ============================================
-- FIX 2: Set email confirm expiry to shorter time
-- ============================================
-- If confirmation emails are sending but failing, reduce expiry

-- UPDATE auth.config SET value = '3600' WHERE key = 'email_confirm_expire'; -- 1 hour

-- ============================================
-- FIX 3: Disable secure domain restrictions
-- ============================================
-- If you have site URL restrictions, they might block signup

-- Check if there are site URL restrictions
SELECT key, value FROM auth.config WHERE key LIKE '%site%' OR key LIKE '%url%';

-- Disable redirect URLs if needed (careful - this affects security)
-- UPDATE auth.config SET value = '' WHERE key = 'external_phone_redirect_url';

-- ============================================
-- FIX 4: Disable rate limiting for testing
-- ============================================
-- Sometimes aggressive rate limiting causes issues

-- UPDATE auth.config SET value = '1000' WHERE key = 'rate_limit_email_sent';

-- ============================================
-- FIX 5: Allow insecure passwords (FOR TESTING ONLY)
-- ============================================
-- If password validation is too strict, this relaxes it

-- Check current password requirements
SELECT key, value FROM auth.config WHERE key LIKE '%password%';

-- ============================================
-- STEP-BY-STEP DEBUGGING
-- ============================================

-- Run these in order to identify the exact issue:

-- 1. Check if email confirmation is the problem
SELECT 
  'enable_email_confirmation' as setting,
  COALESCE(value, 'NOT SET') as value
FROM auth.config
WHERE key = 'enable_email_confirmation';

-- 2. Check SMTP configuration
SELECT 
  COUNT(*) > 0 as smtp_configured,
  'Check SMTP settings in Dashboard' as note
FROM auth.config
WHERE key LIKE '%smtp%';

-- 3. Check for duplicate email constraint issues
-- This can happen if there's a conflict with existing users
SELECT 
  'Duplicate emails check' as check,
  COUNT(*) as duplicates
FROM (
  SELECT email, COUNT(*) as cnt
  FROM auth.users
  WHERE email IS NOT NULL
  GROUP BY email
  HAVING COUNT(*) > 1
) sub;

-- 4. Check if there are custom hooks interfering
SELECT 
  'Auth hooks check' as check,
  COUNT(*) as hook_count
FROM pg_event_trigger
WHERE evtname LIKE '%auth%' OR evtname LIKE '%users%';

-- ============================================
-- ALTERNATIVE: Manual user creation (if signup continues to fail)
-- ============================================
-- Only use this as a last resort for testing!

-- Step 1: Create user in auth.users directly
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--   uuid_generate_v4(),
--   'test@example.com',
--   -- Use supabase-js to get proper hash: await supabase.auth.admin.createUser({ email, password })
--   'placeholder_will_not_work',
--   NOW(),
--   NOW(),
--   NOW()
-- );

-- Step 2: Create profile
-- INSERT INTO public.profiles (id, email, full_name, role)
-- VALUES (
--   'USER_ID_FROM_ABOVE',
--   'test@example.com',
--   'Test User',
--   'client'
-- );

-- ============================================
-- RECOMMENDED FIXES (in order)
-- ============================================

-- FIX A (Easiest): Turn OFF email confirmation
-- In Supabase Dashboard → Authentication → Providers → Email
-- Toggle OFF "Confirm email"
-- Then try signing up again

-- FIX B (If A doesn't work): Check SMTP settings
-- In Supabase Dashboard → Authentication → Providers → Email
-- Configure SMTP Host/Port with your email provider
-- Or use a service like Resend, SendGrid, AWS SES

-- FIX C (If still failing): Check Supabase Logs
-- In Supabase Dashboard → Logs (or Logs → Postgres)
-- Look for errors from the last signup attempt
-- The actual error message will tell you exactly what's wrong

-- ============================================
-- VERIFICATION QUERIES (run after fixes)
-- ============================================

-- A. Check user was created
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- B. Check profile was created
-- SELECT id, email, full_name, role FROM public.profiles ORDER BY created_at DESC LIMIT 5;

-- C. Check if there are any errors in logs
-- (This requires access to Supabase Dashboard logs)
