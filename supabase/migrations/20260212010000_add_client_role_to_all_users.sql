-- Migration: Add 'client' role to all users who have listings
-- Run this in Supabase SQL Editor
--
-- Problem: Users who uploaded listings but don't have 'client' role in user_roles
-- won't show up on owner's swipe deck because query filters by user_roles.role = 'client'
--
-- Solution: Add 'client' role to all users who have listings

-- Step 1: Add client role to all users who have listings but no client role
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT l.owner_id, 'client'
FROM public.listings l
WHERE l.owner_id NOT IN (
    SELECT user_id FROM public.user_roles WHERE role = 'client'
)
ON CONFLICT (user_id) DO NOTHING;

-- Step 2: Also add client role to all profiles that don't have any role
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT p.id, 'client'
FROM public.profiles p
WHERE p.id NOT IN (
    SELECT user_id FROM public.user_roles
)
ON CONFLICT (user_id) DO NOTHING;

-- Step 3: Verify the fix - count how many users now have client role
SELECT
    COUNT(*) FILTER (WHERE role = 'client') as client_count,
    COUNT(*) FILTER (WHERE role = 'owner') as owner_count,
    COUNT(*) FILTER (WHERE role = 'worker') as worker_count,
    COUNT(*) as total_roles
FROM public.user_roles;

-- Step 4: Check how many listings owners now have client role
SELECT
    COUNT(DISTINCT l.owner_id) as total_listing_owners,
    COUNT(DISTINCT l.owner_id) FILTER (WHERE ur.role = 'client') as owners_with_client_role
FROM public.listings l
LEFT JOIN public.user_roles ur ON l.owner_id = ur.user_id AND ur.role = 'client';
