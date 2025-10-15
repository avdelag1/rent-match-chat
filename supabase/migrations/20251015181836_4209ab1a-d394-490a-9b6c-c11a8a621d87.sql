-- Fix user roles: Set owner@owner.com to owner role
UPDATE user_roles 
SET role = 'owner' 
WHERE user_id = '63c34301-8e40-403b-a09b-25c1298d1b8d';

-- Update any users who have listings to be owners
UPDATE user_roles ur
SET role = 'owner'
WHERE ur.user_id IN (
  SELECT DISTINCT owner_id 
  FROM listings 
  WHERE owner_id IS NOT NULL
)
AND ur.role != 'owner';