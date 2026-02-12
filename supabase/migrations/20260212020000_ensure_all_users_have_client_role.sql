-- Migration: Ensure all users get 'client' role automatically
-- Run this in Supabase SQL Editor
--
-- Problem: The query for owner swipe cards filters by user_roles.role = 'client'
-- Users who signed up as 'owner' don't appear because they only have 'owner' role
--
-- Solution: Add 'client' role to EVERY user, so everyone appears on both sides

-- Update the trigger to always add 'client' role (on top of signup role)
-- This migration updates the handle_new_user function

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
    v_role TEXT;
BEGIN
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        ''
    );
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');

    BEGIN
        INSERT INTO public.profiles (
            id, email, full_name, role, is_active, onboarding_completed,
            created_at, updated_at
        ) VALUES (
            NEW.id, NEW.email, v_full_name, v_role, true, true, NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            is_active = true,
            onboarding_completed = true,
            updated_at = NOW();

        -- CRITICAL: Add 'client' role to EVERY user (on top of signup role)
        -- This ensures users appear on owner's swipe deck regardless of signup role
        INSERT INTO public.user_roles (user_id, role, created_at)
        VALUES (NEW.id, 'client', NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            role = EXCLUDED.role,
            updated_at = NOW();

        -- Also add their signup role if different from client
        IF v_role <> 'client' THEN
            INSERT INTO public.user_roles (user_id, role, created_at)
            VALUES (NEW.id, v_role, NOW())
            ON CONFLICT (user_id) DO NOTHING;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Silently continue — frontend will create profile
        NULL;
    END;

    RETURN NEW;
END;
$$;

-- Now add client role to ALL existing users (not just new signups)
-- This ensures all existing users appear on owner's swipe deck
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT DISTINCT p.id, 'client', NOW()
FROM public.profiles p
WHERE p.id NOT IN (
    SELECT user_id FROM public.user_roles WHERE role = 'client'
)
ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = NOW();

-- Verify the fix
SELECT
    COUNT(*) FILTER (WHERE role = 'client') as client_count,
    COUNT(*) FILTER (WHERE role = 'owner') as owner_count,
    COUNT(*) FILTER (WHERE role = 'worker') as worker_count,
    COUNT(DISTINCT user_id) as total_users_with_roles
FROM public.user_roles;
