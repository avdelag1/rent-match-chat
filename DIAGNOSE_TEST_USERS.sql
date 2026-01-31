-- ================================================================
-- DIAGNOSE TEST USERS - What's wrong?
-- ================================================================

-- Check if users exist in auth.users
SELECT
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at,
    created_at,
    role,
    aud
FROM auth.users
WHERE email LIKE 'test%@zwipes.com'
ORDER BY email;

-- Check if profiles exist
SELECT
    'profiles' as table_name,
    id,
    email,
    full_name,
    role,
    is_active,
    onboarding_completed,
    created_at
FROM public.profiles
WHERE email LIKE 'test%@zwipes.com'
ORDER BY email;

-- Check if user_roles exist
SELECT
    'user_roles' as table_name,
    user_id,
    role,
    created_at
FROM public.user_roles
WHERE user_id IN (
    SELECT id FROM public.profiles WHERE email LIKE 'test%@zwipes.com'
)
ORDER BY created_at;

-- Check instance_id (might be wrong)
SELECT
    'instance_id check' as check_name,
    instance_id,
    COUNT(*) as count
FROM auth.users
WHERE email LIKE 'test%@zwipes.com'
GROUP BY instance_id;

-- Show what instance_id SHOULD be
SELECT
    'correct instance_id' as check_name,
    DISTINCT instance_id
FROM auth.users
WHERE email NOT LIKE 'test%@zwipes.com'
LIMIT 1;
