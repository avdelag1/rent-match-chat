-- ============================================
-- CORRECTED RLS FIX FOR ALL PAGE ACCESS
-- Fixes all page access issues by ensuring proper policies exist
-- Works with actual schema (profiles table has role column)
-- ============================================

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Allow users to insert their own profile (during signup)
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "users_insert_own_profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to select their own profile
DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
CREATE POLICY "users_select_own_profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow browsing active profiles for matching/swiping
DROP POLICY IF EXISTS "authenticated_users_can_browse_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "authenticated_users_can_browse_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (is_active = true OR auth.uid() = id);

-- ============================================
-- LISTINGS TABLE POLICIES
-- ============================================

-- Ensure owners can insert listings
DROP POLICY IF EXISTS "owners_can_insert_listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can insert listings" ON public.listings;
CREATE POLICY "owners_can_insert_listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Ensure owners can update own listings
DROP POLICY IF EXISTS "owners_can_update_own_listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can update own listings" ON public.listings;
CREATE POLICY "owners_can_update_own_listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Ensure owners can delete own listings
DROP POLICY IF EXISTS "owners_can_delete_own_listings" ON public.listings;
CREATE POLICY "owners_can_delete_own_listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Allow users to browse active listings
DROP POLICY IF EXISTS "users_can_browse_active_listings" ON public.listings;
DROP POLICY IF EXISTS "Active listings are viewable" ON public.listings;
CREATE POLICY "users_can_browse_active_listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (is_active = true OR auth.uid() = owner_id);

-- ============================================
-- CLIENT_FILTER_PREFERENCES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "users_manage_own_filter_prefs" ON public.client_filter_preferences;
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.client_filter_preferences;
CREATE POLICY "users_manage_own_filter_prefs"
  ON public.client_filter_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CONVERSATIONS & MESSAGES TABLE POLICIES
-- ============================================

-- Ensure conversation access policies
DROP POLICY IF EXISTS "users_can_view_own_conversations" ON public.conversations;
CREATE POLICY "users_can_view_own_conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR auth.uid() = owner_id
  );

DROP POLICY IF EXISTS "users_can_create_conversations" ON public.conversations;
CREATE POLICY "users_can_create_conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id OR auth.uid() = owner_id
  );

DROP POLICY IF EXISTS "users_can_update_own_conversations" ON public.conversations;
CREATE POLICY "users_can_update_own_conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = owner_id)
  WITH CHECK (auth.uid() = client_id OR auth.uid() = owner_id);

-- Ensure message access policies (conversation_messages table, not messages)
DROP POLICY IF EXISTS "users_can_view_conversation_messages" ON public.conversation_messages;
CREATE POLICY "users_can_view_conversation_messages"
  ON public.conversation_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (client_id = auth.uid() OR owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "users_can_send_messages" ON public.conversation_messages;
CREATE POLICY "users_can_send_messages"
  ON public.conversation_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (client_id = auth.uid() OR owner_id = auth.uid())
    )
  );

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "users_can_view_own_notifications" ON public.notifications;
CREATE POLICY "users_can_view_own_notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_can_update_own_notifications" ON public.notifications;
CREATE POLICY "users_can_update_own_notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_can_delete_own_notifications" ON public.notifications;
CREATE POLICY "users_can_delete_own_notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow system to create notifications
DROP POLICY IF EXISTS "system_can_create_notifications" ON public.notifications;
CREATE POLICY "system_can_create_notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- LIKES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "users_can_view_own_likes" ON public.likes;
DROP POLICY IF EXISTS "Users can view own likes" ON public.likes;
CREATE POLICY "users_can_view_own_likes"
  ON public.likes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_can_insert_likes" ON public.likes;
DROP POLICY IF EXISTS "Users can like listings" ON public.likes;
CREATE POLICY "users_can_insert_likes"
  ON public.likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_can_delete_own_likes" ON public.likes;
CREATE POLICY "users_can_delete_own_likes"
  ON public.likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- CRITICAL: Allow owners to see who liked their listings
DROP POLICY IF EXISTS "owners_can_see_likes_on_listings" ON public.likes;
CREATE POLICY "owners_can_see_likes_on_listings"
  ON public.likes FOR SELECT
  TO authenticated
  USING (
    target_type = 'listing' AND
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = target_id AND owner_id = auth.uid()
    )
  );

-- Allow users to update their own likes (for direction changes)
DROP POLICY IF EXISTS "users_can_update_own_likes" ON public.likes;
CREATE POLICY "users_can_update_own_likes"
  ON public.likes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SWIPES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "users_can_delete_own_swipes" ON public.swipes;
CREATE POLICY "users_can_delete_own_swipes"
  ON public.swipes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- SAVED_LISTINGS TABLE POLICIES
-- ============================================

-- Already has policies but ensure UPDATE is included
DROP POLICY IF EXISTS "users_can_update_saved_listings" ON public.saved_listings;
CREATE POLICY "users_can_update_saved_listings"
  ON public.saved_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "users_can_view_own_subscriptions" ON public.subscriptions;
CREATE POLICY "users_can_view_own_subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_can_insert_own_subscriptions" ON public.subscriptions;
CREATE POLICY "users_can_insert_own_subscriptions"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_can_update_own_subscriptions" ON public.subscriptions;
CREATE POLICY "users_can_update_own_subscriptions"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- MATCHES TABLE POLICIES (ensure complete)
-- ============================================

DROP POLICY IF EXISTS "users_can_delete_own_matches" ON public.matches;
CREATE POLICY "users_can_delete_own_matches"
  ON public.matches FOR DELETE
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = owner_id);

-- ============================================
-- GRANT PERMISSIONS (ensure authenticated users have access)
-- ============================================

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_filter_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT, INSERT ON public.conversation_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.likes TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.swipes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_listings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;

-- Grant on listings_photos
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings_photos TO authenticated;

-- Grant on user_roles
GRANT SELECT, INSERT, UPDATE ON public.user_roles TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

-- You can run this to verify all policies are in place:
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename IN ('profiles', 'listings', 'conversations', 'conversation_messages', 'notifications', 'likes', 'user_roles')
-- ORDER BY tablename, policyname;
