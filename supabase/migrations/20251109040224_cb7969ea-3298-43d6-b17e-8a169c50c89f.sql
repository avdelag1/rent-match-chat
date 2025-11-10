-- Allow users to view profiles of people they have conversations with
CREATE POLICY "Users can view profiles of conversation partners"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- User can view their own profile
  auth.uid() = id
  OR
  -- User can view profiles of people they have conversations with
  EXISTS (
    SELECT 1
    FROM conversations
    WHERE (
      (conversations.client_id = auth.uid() AND conversations.owner_id = profiles.id)
      OR
      (conversations.owner_id = auth.uid() AND conversations.client_id = profiles.id)
    )
    AND conversations.status = 'active'
  )
);