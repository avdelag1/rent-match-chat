-- Allow authenticated users to view roles of other users (needed for matching)
CREATE POLICY "Users can view roles for matching" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (true);

-- This enables owners to see which users are clients and vice versa for the matching system