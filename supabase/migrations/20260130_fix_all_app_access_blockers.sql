-- ============================================
-- COMPREHENSIVE RLS FIX FOR ALL APP ACCESS
-- Fixes all page access issues by ensuring proper policies exist
-- ============================================

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Allow users to insert their own profile (during signup)
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
CREATE POLICY "users_insert_own_profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
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

-- Allow browsing active, completed profiles for matching/swiping
DROP POLICY IF EXISTS "authenticated_users_can_browse_active_profiles" ON public.profiles;
CREATE POLICY "authenticated_users_can_browse_active_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND onboarding_completed = true
  );

-- ============================================
-- USER_ROLES TABLE POLICIES
-- ============================================

-- Allow users to view their own role (critical for app routing)
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "users_view_own_role" ON public.user_roles;
CREATE POLICY "users_view_own_role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own role (during signup)
DROP POLICY IF EXISTS "users_insert_own_role" ON public.user_roles;
CREATE POLICY "users_insert_own_role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CLIENT_PROFILES TABLE POLICIES
-- ============================================

-- Allow users to insert their own client profile
DROP POLICY IF EXISTS "users_insert_own_client_profile" ON public.client_profiles;
CREATE POLICY "users_insert_own_client_profile"
  ON public.client_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own client profile
DROP POLICY IF EXISTS "users_update_own_client_profile" ON public.client_profiles;
CREATE POLICY "users_update_own_client_profile"
  ON public.client_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own client profile
DROP POLICY IF EXISTS "users_select_own_client_profile" ON public.client_profiles;
CREATE POLICY "users_select_own_client_profile"
  ON public.client_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow owners to browse active client profiles
DROP POLICY IF EXISTS "owners_can_browse_client_profiles" ON public.client_profiles;
CREATE POLICY "owners_can_browse_client_profiles"
  ON public.client_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND is_active = true
      AND onboarding_completed = true
    )
  );

-- ============================================
-- OWNER_PROFILES TABLE POLICIES
-- ============================================

-- Allow users to insert their own owner profile
DROP POLICY IF EXISTS "users_insert_own_owner_profile" ON public.owner_profiles;
CREATE POLICY "users_insert_own_owner_profile"
  ON public.owner_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own owner profile
DROP POLICY IF EXISTS "users_update_own_owner_profile" ON public.owner_profiles;
CREATE POLICY "users_update_own_owner_profile"
  ON public.owner_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own owner profile
DROP POLICY IF EXISTS "users_select_own_owner_profile" ON public.owner_profiles;
CREATE POLICY "users_select_own_owner_profile"
  ON public.owner_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow clients to browse active owner profiles
DROP POLICY IF EXISTS "clients_can_browse_owner_profiles" ON public.owner_profiles;
CREATE POLICY "clients_can_browse_owner_profiles"
  ON public.owner_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND is_active = true
      AND onboarding_completed = true
    )
  );

-- ============================================
-- LISTINGS TABLE POLICIES
-- ============================================

-- Ensure listings policies exist
DROP POLICY IF EXISTS "owners_can_insert_listings" ON public.listings;
CREATE POLICY "owners_can_insert_listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "owners_can_update_own_listings" ON public.listings;
CREATE POLICY "owners_can_update_own_listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "owners_can_delete_own_listings" ON public.listings;
CREATE POLICY "owners_can_delete_own_listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "users_can_browse_active_listings" ON public.listings;
CREATE POLICY "users_can_browse_active_listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "owners_can_view_own_listings" ON public.listings;
CREATE POLICY "owners_can_view_own_listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

-- ============================================
-- CLIENT_FILTER_PREFERENCES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "users_manage_own_filter_prefs" ON public.client_filter_preferences;
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

-- Ensure message access policies
DROP POLICY IF EXISTS "users_can_view_conversation_messages" ON public.messages;
CREATE POLICY "users_can_view_conversation_messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (client_id = auth.uid() OR owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "users_can_send_messages" ON public.messages;
CREATE POLICY "users_can_send_messages"
  ON public.messages FOR INSERT
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

-- ============================================
-- LIKES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "users_can_view_own_likes" ON public.likes;
CREATE POLICY "users_can_view_own_likes"
  ON public.likes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_can_insert_likes" ON public.likes;
CREATE POLICY "users_can_insert_likes"
  ON public.likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_can_delete_own_likes" ON public.likes;
CREATE POLICY "users_can_delete_own_likes"
  ON public.likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to view likes they received (for "who liked you" pages)
DROP POLICY IF EXISTS "users_can_view_received_likes" ON public.likes;
CREATE POLICY "users_can_view_received_likes"
  ON public.likes FOR SELECT
  TO authenticated
  USING (auth.uid()::text = target_id);

-- ============================================
-- SAVED_SEARCHES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "users_manage_own_saved_searches" ON public.saved_searches;
CREATE POLICY "users_manage_own_saved_searches"
  ON public.saved_searches FOR ALL
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
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.client_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.owner_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_filter_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_searches TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

-- You can run this to verify all policies are in place:
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename IN ('profiles', 'user_roles', 'client_profiles', 'owner_profiles', 'listings', 'conversations', 'messages', 'notifications', 'likes')
-- ORDER BY tablename, policyname;
