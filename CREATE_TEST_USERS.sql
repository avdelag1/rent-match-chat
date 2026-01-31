-- ================================================================
-- CREATE 2 TEST USERS - Bypass broken signup
-- Run this in Supabase SQL Editor
-- ================================================================

-- IMPORTANT: This creates users with a simple password
-- Test Credentials:
--   User 1: test1@zwipes.com / TestPass123!
--   User 2: test2@zwipes.com / TestPass123!

-- Generate user IDs
DO $$
DECLARE
    user1_id UUID := gen_random_uuid();
    user2_id UUID := gen_random_uuid();
    encrypted_pass TEXT;
BEGIN
    -- Get encrypted password hash
    -- Supabase uses crypt() function for passwords
    encrypted_pass := crypt('TestPass123!', gen_salt('bf'));

    -- ================================================================
    -- USER 1: CLIENT
    -- ================================================================

    -- Create auth user 1 (client)
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        aud,
        role,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        user1_id,
        '00000000-0000-0000-0000-000000000000',
        'test1@zwipes.com',
        encrypted_pass,
        NOW(),
        NOW(),
        NOW(),
        '',
        'authenticated',
        'authenticated',
        '{"provider":"email","providers":["email"]}',
        '{"role":"client","name":"Test Client","full_name":"Test Client"}'
    );

    -- Create profile for user 1
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        is_active,
        onboarding_completed,
        created_at,
        updated_at
    ) VALUES (
        user1_id,
        'test1@zwipes.com',
        'Test Client',
        'client',
        true,
        true,
        NOW(),
        NOW()
    );

    -- Create user_role for user 1
    INSERT INTO public.user_roles (
        user_id,
        role,
        created_at,
        updated_at
    ) VALUES (
        user1_id,
        'client',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Grant welcome activation to user 1
    INSERT INTO public.message_activations (
        user_id,
        activation_type,
        total_activations,
        remaining_activations,
        used_activations,
        expires_at,
        notes,
        created_at,
        updated_at
    ) VALUES (
        user1_id,
        'referral_bonus',
        5,
        5,
        0,
        NOW() + INTERVAL '90 days',
        'Test user - 5 free messages',
        NOW(),
        NOW()
    );

    -- ================================================================
    -- USER 2: OWNER
    -- ================================================================

    -- Create auth user 2 (owner)
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        aud,
        role,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        user2_id,
        '00000000-0000-0000-0000-000000000000',
        'test2@zwipes.com',
        encrypted_pass,
        NOW(),
        NOW(),
        NOW(),
        '',
        'authenticated',
        'authenticated',
        '{"provider":"email","providers":["email"]}',
        '{"role":"owner","name":"Test Owner","full_name":"Test Owner"}'
    );

    -- Create profile for user 2
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        is_active,
        onboarding_completed,
        created_at,
        updated_at
    ) VALUES (
        user2_id,
        'test2@zwipes.com',
        'Test Owner',
        'owner',
        true,
        true,
        NOW(),
        NOW()
    );

    -- Create user_role for user 2
    INSERT INTO public.user_roles (
        user_id,
        role,
        created_at,
        updated_at
    ) VALUES (
        user2_id,
        'owner',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Grant welcome activation to user 2
    INSERT INTO public.message_activations (
        user_id,
        activation_type,
        total_activations,
        remaining_activations,
        used_activations,
        expires_at,
        notes,
        created_at,
        updated_at
    ) VALUES (
        user2_id,
        'referral_bonus',
        5,
        5,
        0,
        NOW() + INTERVAL '90 days',
        'Test user - 5 free messages',
        NOW(),
        NOW()
    );

    -- Success message
    RAISE NOTICE '✅ Test users created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '👤 USER 1 (CLIENT):';
    RAISE NOTICE '   Email: test1@zwipes.com';
    RAISE NOTICE '   Password: TestPass123!';
    RAISE NOTICE '   ID: %', user1_id;
    RAISE NOTICE '';
    RAISE NOTICE '👤 USER 2 (OWNER):';
    RAISE NOTICE '   Email: test2@zwipes.com';
    RAISE NOTICE '   Password: TestPass123!';
    RAISE NOTICE '   ID: %', user2_id;
    RAISE NOTICE '';
    RAISE NOTICE '💡 Both users have 5 free messages for testing';
    RAISE NOTICE '🎯 You can now sign in and test listings/swipe cards!';

END $$;

-- Verify users were created
SELECT
    'Test users created:' as status,
    COUNT(*) as user_count
FROM auth.users
WHERE email LIKE 'test%@zwipes.com';

-- Show profiles
SELECT
    id,
    email,
    full_name,
    role,
    onboarding_completed,
    created_at
FROM public.profiles
WHERE email LIKE 'test%@zwipes.com'
ORDER BY email;
