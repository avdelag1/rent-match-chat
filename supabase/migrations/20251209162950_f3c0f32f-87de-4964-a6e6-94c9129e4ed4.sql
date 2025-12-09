-- Fix overly permissive RLS policies (security issue: PUBLIC_DATA_EXPOSURE)
-- Remove dangerous "qual:true" policies that allow any user to access all data

-- 1. Fix match_conversations - remove the overly permissive ALL policy
DROP POLICY IF EXISTS "Authenticated users can manage match conversations" ON public.match_conversations;

-- Add proper UPDATE and DELETE policies based on sender_id ownership
CREATE POLICY "Users can update own match conversations"
ON public.match_conversations FOR UPDATE
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete own match conversations"
ON public.match_conversations FOR DELETE
USING (sender_id = auth.uid());

-- 2. Fix property_match_messages - remove overly permissive ALL policy
DROP POLICY IF EXISTS "Users can manage their property match messages" ON public.property_match_messages;

-- Add proper UPDATE and DELETE policies
CREATE POLICY "Users can update own property match messages"
ON public.property_match_messages FOR UPDATE
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete own property match messages"
ON public.property_match_messages FOR DELETE
USING (sender_id = auth.uid());

-- 3. Fix property_swipes - remove overly permissive ALL policy
DROP POLICY IF EXISTS "Users can manage their property swipes" ON public.property_swipes;

-- Add proper UPDATE and DELETE policies
CREATE POLICY "Users can update own property swipes"
ON public.property_swipes FOR UPDATE
USING (swiper_id = auth.uid())
WITH CHECK (swiper_id = auth.uid());

CREATE POLICY "Users can delete own property swipes"
ON public.property_swipes FOR DELETE
USING (swiper_id = auth.uid());

-- 4. Fix user_search_preferences - remove overly permissive ALL policy
DROP POLICY IF EXISTS "Users can manage their search preferences" ON public.user_search_preferences;

-- Add proper DELETE policy (INSERT, UPDATE, SELECT already exist with proper checks)
CREATE POLICY "Users can delete own search preferences"
ON public.user_search_preferences FOR DELETE
USING (user_id = auth.uid());

-- 5. Fix rate_limit_log - this should only be managed by service role, not users
DROP POLICY IF EXISTS "Service can manage rate limits" ON public.rate_limit_log;

-- Only allow SELECT for users to see their own rate limits
CREATE POLICY "Users can view own rate limits"
ON public.rate_limit_log FOR SELECT
USING (identifier = auth.uid()::text OR identifier = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- No INSERT/UPDATE/DELETE for regular users - only service role should manage this

-- 6. Fix user_roles - remove public viewing, restrict to own role only
DROP POLICY IF EXISTS "Allow viewing all user roles" ON public.user_roles;

-- Users should only see their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Also remove dangerous UPDATE and DELETE policies that allow privilege escalation
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own role" ON public.user_roles;

-- Only admins should be able to modify roles
CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true));