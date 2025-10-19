-- Fix RLS policies to allow client discovery

-- Update user_roles table policies
-- Drop the restrictive policy that only allows users to see their own role
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;

-- Create a new policy allowing all authenticated users to view user roles
-- This is necessary for the owner dashboard to discover clients via INNER JOIN
CREATE POLICY "Allow viewing all user roles"
ON user_roles
FOR SELECT
TO authenticated
USING (true);

-- Add comment explaining the security model
COMMENT ON POLICY "Allow viewing all user roles" ON user_roles IS 
'Allows authenticated users to view all user roles for discovery features. User roles (client/owner) are not sensitive data and determine app functionality.';