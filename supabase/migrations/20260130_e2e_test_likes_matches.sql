-- ============================================
-- END-TO-END TEST: Likes → Matches → Notifications
-- Date: 2026-01-30
-- Purpose: Test the complete flow manually
-- ============================================

-- INSTRUCTIONS: Run each section one at a time in Supabase SQL Editor

-- ============================================
-- TEST SETUP: Create test data
-- ============================================

-- NOTE: Replace these UUIDs with actual user/listing UUIDs from your database

-- Step 1: Get existing users and listings
-- Run this first to see what data exists:

-- Get listings (copy an id from results):
-- SELECT id, title, owner_id FROM public.listings LIMIT 5;

-- Get profiles (copy a client id that is NOT the listing owner):
-- SELECT id, email, full_name, role FROM public.profiles WHERE role = 'client' LIMIT 5;

-- ============================================
-- MANUAL TEST (Copy-Paste these with real UUIDs)
-- ============================================

-- EXAMPLE: Replace these values with real ones from your DB
-- \set listing_id 'abc123-uuid-here'
-- \set client_id 'def456-uuid-here'
-- \set owner_id 'ghi789-uuid-here'

-- TEST 1: Client likes a listing
-- This SHOULD create a "pending like" notification for the owner
INSERT INTO public.likes (user_id, target_id, target_type, direction, source)
VALUES (
  'CLIENT_UUID_HERE',  -- Replace with a client user ID
  'LISTING_UUID_HERE', -- Replace with a listing ID
  'listing',
  'right',
  'web'
);

-- Check what happened:
-- SELECT 'LIKE INSERTED' as step, * FROM public.likes ORDER BY created_at DESC LIMIT 1;
-- SELECT 'NOTIFICATIONS' as step, * FROM public.notifications ORDER BY created_at DESC LIMIT 5;

-- ============================================
-- TEST 2: Owner likes the client back
-- This SHOULD create a MATCH and notifications for BOTH

INSERT INTO public.owner_likes (owner_id, client_id, listing_id, is_super_like)
VALUES (
  'OWNER_UUID_HERE',   -- Replace with the listing's owner ID
  'CLIENT_UUID_HERE',  -- Same client from TEST 1
  'LISTING_UUID_HERE', -- Same listing from TEST 1
  false
);

-- Check what happened:
-- SELECT 'MATCH CREATED' as step, * FROM public.matches ORDER BY created_at DESC LIMIT 5;
-- SELECT 'NOTIFICATIONS' as step, * FROM public.notifications WHERE type = 'match' ORDER BY created_at DESC;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all likes:
SELECT
  l.id,
  l.user_id as client_id,
  l.target_id as listing_id,
  l.target_type,
  l.direction,
  l.created_at as liked_at
FROM public.likes l
ORDER BY l.created_at DESC
LIMIT 20;

-- Check all owner likes:
SELECT
  ol.id,
  ol.owner_id,
  ol.client_id,
  ol.listing_id,
  ol.is_super_like,
  ol.created_at as liked_at
FROM public.owner_likes ol
ORDER BY ol.created_at DESC
LIMIT 20;

-- Check matches:
SELECT
  m.id,
  m.listing_id,
  m.client_id,
  m.owner_id,
  m.status,
  m.created_at as matched_at,
  p_client.full_name as client_name,
  p_owner.full_name as owner_name
FROM public.matches m
LEFT JOIN public.profiles p_client ON m.client_id = p_client.id
LEFT JOIN public.profiles p_owner ON m.owner_id = p_owner.id
ORDER BY m.created_at DESC
LIMIT 20;

-- Check notifications:
SELECT
  n.id,
  n.user_id,
  n.type,
  n.title,
  n.message,
  n.data,
  n.created_at
FROM public.notifications n
ORDER BY n.created_at DESC
LIMIT 30;

-- ============================================
-- EXPECTED RESULTS AFTER SUCCESSFUL TEST
-- ============================================

-- 1. Table `likes` should have 1 row (client → listing)
-- 2. Table `owner_likes` should have 1 row (owner → client)
-- 3. Table `matches` should have 1 row (listing + client + owner)
-- 4. Table `notifications` should have:
--    - 1 row for owner (from client like - "New Interest!")
--    - 2 rows from match creation (1 for client, 1 for owner - "New Match!")

-- ============================================
-- CLEANUP (Remove test data)
-- ============================================

-- Only run this if you want to remove the test data:
-- DELETE FROM public.matches WHERE created_at > '2026-01-30';
-- DELETE FROM public.notifications WHERE created_at > '2026-01-30';
-- DELETE FROM public.likes WHERE created_at > '2026-01-30';
-- DELETE FROM public.owner_likes WHERE created_at > '2026-01-30';
