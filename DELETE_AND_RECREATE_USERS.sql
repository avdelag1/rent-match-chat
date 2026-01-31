-- ================================================================
-- DELETE AND RECREATE TEST USERS - With correct instance_id
-- ================================================================

-- Step 1: Delete existing test users completely
DELETE FROM public.user_roles WHERE user_id IN (SELECT id FROM public.profiles WHERE email LIKE 'test%@zwipes.com');
DELETE FROM public.profiles WHERE email LIKE 'test%@zwipes.com';
DELETE FROM auth.users WHERE email LIKE 'test%@zwipes.com';

-- Step 2: Get the correct instance_id from existing users
DO $$
DECLARE
    user1_id UUID := gen_random_uuid();
    user2_id UUID := gen_random_uuid();
    encrypted_pass TEXT;
    correct_instance_id UUID;
BEGIN
    -- Get the REAL instance_id from an existing user
    SELECT instance_id INTO correct_instance_id
    FROM auth.users
    WHERE email NOT LIKE 'test%'
    LIMIT 1;

    -- If no users exist, use a default
    IF correct_instance_id IS NULL THEN
        correct_instance_id := '00000000-0000-0000-0000-000000000000';
    END IF;

    -- Hash password
    encrypted_pass := crypt('TestPass123!', gen_salt('bf'));

    RAISE NOTICE 'Using instance_id: %', correct_instance_id;

    -- USER 1: CLIENT
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, confirmation_token, aud, role,
        raw_app_meta_data, raw_user_meta_data
    ) VALUES (
        user1_id, correct_instance_id, 'test1@zwipes.com', encrypted_pass, NOW(),
        NOW(), NOW(), '', 'authenticated', 'authenticated',
        '{"provider":"email","providers":["email"]}',
        '{"role":"client","name":"Test Client","full_name":"Test Client"}'
    );

    INSERT INTO public.profiles (id, email, full_name, role, is_active, onboarding_completed, created_at, updated_at)
    VALUES (user1_id, 'test1@zwipes.com', 'Test Client', 'client', true, true, NOW(), NOW());

    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (user1_id, 'client', NOW());

    -- USER 2: OWNER
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, confirmation_token, aud, role,
        raw_app_meta_data, raw_user_meta_data
    ) VALUES (
        user2_id, correct_instance_id, 'test2@zwipes.com', encrypted_pass, NOW(),
        NOW(), NOW(), '', 'authenticated', 'authenticated',
        '{"provider":"email","providers":["email"]}',
        '{"role":"owner","name":"Test Owner","full_name":"Test Owner"}'
    );

    INSERT INTO public.profiles (id, email, full_name, role, is_active, onboarding_completed, created_at, updated_at)
    VALUES (user2_id, 'test2@zwipes.com', 'Test Owner', 'owner', true, true, NOW(), NOW());

    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (user2_id, 'owner', NOW());

    RAISE NOTICE '✅ Users recreated with correct instance_id';
    RAISE NOTICE 'test1@zwipes.com / TestPass123! (CLIENT)';
    RAISE NOTICE 'test2@zwipes.com / TestPass123! (OWNER)';
END $$;

-- Verify
SELECT 'Created:' as status, email, role, email_confirmed_at
FROM auth.users
WHERE email LIKE 'test%@zwipes.com'
ORDER BY email;
