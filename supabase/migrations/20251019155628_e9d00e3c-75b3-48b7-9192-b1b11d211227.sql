-- Allow authenticated users to view active client profiles for discovery
CREATE POLICY "Authenticated users can view active client profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = profiles.id 
    AND user_roles.role = 'client'
  )
);

-- Add explanatory comment
COMMENT ON POLICY "Authenticated users can view active client profiles" ON profiles IS 
'Allows owners to discover client profiles for matching. Only shows active profiles of users with client role.';