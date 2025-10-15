-- FORCE UPDATE owner@owner.com to owner role
UPDATE user_roles 
SET role = 'owner' 
WHERE user_id = '63c34301-8e40-403b-a09b-25c1298d1b8d';

-- Verify the update
SELECT ur.user_id, ur.role, au.email 
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'owner@owner.com';