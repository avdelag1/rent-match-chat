-- =====================================================
-- FIX NOTIFICATIONS RLS: Allow creating notifications for other users
-- =====================================================

-- Add INSERT policy - authenticated users can create notifications for any user
-- This is needed because when User A likes User B, User A creates a notification for User B
CREATE POLICY "Users can create notifications for others"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add UPDATE policy - users can only update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy - users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- CLEAR ALL MOCK/PLACEHOLDER PHOTOS FROM DATABASE
-- =====================================================

-- Clear client_profiles mock images
UPDATE client_profiles
SET profile_images = NULL
WHERE profile_images IS NOT NULL;

-- Clear profiles mock images and avatars  
UPDATE profiles
SET 
  images = NULL,
  avatar_url = NULL,
  profile_photo_url = NULL
WHERE 
  images IS NOT NULL
  OR avatar_url IS NOT NULL
  OR profile_photo_url IS NOT NULL;

-- Clear listings mock images
UPDATE listings
SET images = NULL
WHERE images IS NOT NULL;