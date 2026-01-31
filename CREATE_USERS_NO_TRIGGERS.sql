-- ================================================================
-- CREATE TEST USERS - Disable ALL broken triggers first
-- ================================================================

-- Step 1: Drop ALL triggers on auth.users (they're all broken)
-- ================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS hook_create_profile_on_signup ON auth.users;

-- Drop the broken functions too
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.hook_create_profile_on_signup() CASCADE;

-- Step 2: Create test users without any triggers interfering
-- ================================================================

DO $$
DECLARE
    user1_id UUID := gen_random_uuid();
    user2_id UUID := gen_random_uuid();
    encrypted_pass TEXT;
BEGIN
    encrypted_pass := crypt('TestPass123!', gen_salt('bf'));

    -- USER 1: CLIENT
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, confirmation_token, aud, role,
        raw_app_meta_data, raw_user_meta_data
    ) VALUES (
        user1_id, '00000000-0000-0000-0000-000000000000', 'test1@zwipes.com',
        encrypted_pass, NOW(), NOW(), NOW(), '', 'authenticated', 'authenticated',
        '{"provider":"email","providers":["email"]}',
        '{"role":"client","name":"Test Client","full_name":"Test Client"}'
    );

    INSERT INTO public.profiles (id, email, full_name, role, is_active, onboarding_completed, created_at, updated_at)
    VALUES (user1_id, 'test1@zwipes.com', 'Test Client', 'client', true, true, NOW(), NOW());

    INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
    VALUES (user1_id, 'client', NOW(), NOW()) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.message_activations (
        user_id, activation_type, total_activations, remaining_activations,
        used_activations, expires_at, notes, created_at, updated_at
    ) VALUES (
        user1_id, 'referral_bonus', 5, 5, 0, NOW() + INTERVAL '90 days',
        'Test user - 5 free messages', NOW(), NOW()
    );

    -- USER 2: OWNER
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, confirmation_token, aud, role,
        raw_app_meta_data, raw_user_meta_data
    ) VALUES (
        user2_id, '00000000-0000-0000-0000-000000000000', 'test2@zwipes.com',
        encrypted_pass, NOW(), NOW(), NOW(), '', 'authenticated', 'authenticated',
        '{"provider":"email","providers":["email"]}',
        '{"role":"owner","name":"Test Owner","full_name":"Test Owner"}'
    );

    INSERT INTO public.profiles (id, email, full_name, role, is_active, onboarding_completed, created_at, updated_at)
    VALUES (user2_id, 'test2@zwipes.com', 'Test Owner', 'owner', true, true, NOW(), NOW());

    INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
    VALUES (user2_id, 'owner', NOW(), NOW()) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.message_activations (
        user_id, activation_type, total_activations, remaining_activations,
        used_activations, expires_at, notes, created_at, updated_at
    ) VALUES (
        user2_id, 'referral_bonus', 5, 5, 0, NOW() + INTERVAL '90 days',
        'Test user - 5 free messages', NOW(), NOW()
    );

    RAISE NOTICE '✅ Users created!';
    RAISE NOTICE 'test1@zwipes.com / TestPass123! (client)';
    RAISE NOTICE 'test2@zwipes.com / TestPass123! (owner)';
END $$;

-- Step 3: Recreate working trigger for future signups
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_full_name TEXT;
    v_role TEXT;
BEGIN
    -- FIXED: Only use raw_user_meta_data (user_metadata doesn't exist!)
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        ''
    );
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');

    INSERT INTO public.profiles (
        id, email, full_name, role, is_active, onboarding_completed,
        created_at, updated_at
    ) VALUES (
        NEW.id, NEW.email, v_full_name, v_role, true, true, NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_role)
    ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = NOW();

    INSERT INTO public.message_activations (
        user_id, activation_type, total_activations, remaining_activations,
        used_activations, expires_at, notes
    ) VALUES (
        NEW.id, 'referral_bonus', 1, 1, 0,
        NOW() + INTERVAL '90 days', 'Welcome bonus'
    ) ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify
SELECT 'Users:' as check, COUNT(*) as count FROM auth.users WHERE email LIKE 'test%@zwipes.com';
SELECT 'Profiles:' as check, COUNT(*) as count FROM public.profiles WHERE email LIKE 'test%@zwipes.com';

SELECT '🎉 DONE! Sign in with test1@zwipes.com or test2@zwipes.com, password: TestPass123!' AS status;
