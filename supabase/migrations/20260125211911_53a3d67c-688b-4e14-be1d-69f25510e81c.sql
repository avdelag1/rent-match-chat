-- ============================================================================
-- SECURITY AUDIT FIX: Enable RLS, Fix Search Paths, Tighten Policies
-- Excludes spatial_ref_sys (PostGIS system table - not modifiable)
-- ============================================================================

-- 1. ENABLE RLS ON PUSH TABLES (internal system tables)
ALTER TABLE public.push_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_outbox_dlq ENABLE ROW LEVEL SECURITY;

-- Push outbox should only be accessible by system/triggers, not directly by users
DROP POLICY IF EXISTS "push_outbox_no_direct_access" ON public.push_outbox;
CREATE POLICY "push_outbox_no_direct_access"
  ON public.push_outbox FOR ALL
  USING (false);

DROP POLICY IF EXISTS "push_outbox_dlq_no_direct_access" ON public.push_outbox_dlq;
CREATE POLICY "push_outbox_dlq_no_direct_access"
  ON public.push_outbox_dlq FOR ALL
  USING (false);

-- 2. FIX SECURITY DEFINER FUNCTIONS - Add search_path = ''

-- Fix is_profile_owner
CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() = profile_user_id;
$$;

-- Fix check_is_admin  
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
    AND is_active = true
  );
$$;

-- Fix handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = auth.uid();
$$;

-- Fix get_weekly_conversation_count
CREATE OR REPLACE FUNCTION public.get_weekly_conversation_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_week_start DATE;
    v_conversation_count INTEGER;
BEGIN
    v_week_start := DATE_TRUNC('week', CURRENT_DATE);
    
    SELECT conversations_started INTO v_conversation_count
    FROM public.conversation_starters
    WHERE user_id = p_user_id AND week_start = v_week_start;
    
    RETURN COALESCE(v_conversation_count, 0);
END;
$$;

-- Fix validate_user_role_access
CREATE OR REPLACE FUNCTION public.validate_user_role_access(p_user_id UUID, p_required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id
    AND role = p_required_role::public.app_role
  );
END;
$$;

-- Fix is_conversation_participant
CREATE OR REPLACE FUNCTION public.is_conversation_participant(c_id UUID, u_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.conversations c
    WHERE c.id = c_id AND (c.client_id = u_id OR c.owner_id = u_id)
  );
$$;

-- Fix grant_welcome_message_activations
CREATE OR REPLACE FUNCTION public.grant_welcome_message_activations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.message_activations (
    user_id,
    activation_type,
    total_activations,
    used_activations,
    expires_at
  ) VALUES (
    NEW.id,
    'pay_per_use',
    5,
    0,
    NOW() + INTERVAL '90 days'
  );
  
  RETURN NEW;
END;
$$;

-- Fix broadcast_conversation_message
CREATE OR REPLACE FUNCTION public.broadcast_conversation_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM realtime.broadcast_changes(
    'conversation:' || NEW.conversation_id::text || ':messages',
    TG_OP,
    TG_OP,
    TG_TABLE_NAME,
    TG_TABLE_SCHEMA,
    NEW,
    OLD
  );
  RETURN NEW;
END;
$$;

-- Fix push_outbox_insert_trigger
CREATE OR REPLACE FUNCTION public.push_outbox_insert_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.push_outbox (conversation_message_id, payload)
  VALUES (NEW.id, to_jsonb(NEW));
  RETURN NEW;
END;
$$;

-- Fix increment_usage_count
CREATE OR REPLACE FUNCTION public.increment_usage_count(p_user_id UUID, p_action TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  CASE p_action
    WHEN 'message' THEN
      UPDATE public.package_usage 
      SET messages_sent_this_week = messages_sent_this_week + 1
      WHERE user_id = p_user_id;
    
    WHEN 'post_property' THEN
      UPDATE public.package_usage 
      SET properties_posted_this_month = properties_posted_this_month + 1
      WHERE user_id = p_user_id;
    
    WHEN 'super_like' THEN
      UPDATE public.package_usage 
      SET super_likes_used_this_month = super_likes_used_this_month + 1
      WHERE user_id = p_user_id;
  END CASE;
END;
$$;

-- Fix toggle_listing_availability
CREATE OR REPLACE FUNCTION public.toggle_listing_availability(p_listing_id UUID, p_new_availability TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_new_availability NOT IN ('available', 'rented', 'sold', 'pending') THEN
    RAISE EXCEPTION 'Invalid availability status: %', p_new_availability;
  END IF;

  UPDATE public.listings
  SET 
    availability_status = p_new_availability,
    updated_at = NOW()
  WHERE id = p_listing_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found: %', p_listing_id;
  END IF;
END;
$$;

-- 3. FIX OVERLY PERMISSIVE RLS POLICY
DROP POLICY IF EXISTS "System can insert security events" ON public.security_event_logs;
CREATE POLICY "Authenticated users can insert security events"
  ON public.security_event_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. ADD increment_helpful_count function for reviews
CREATE OR REPLACE FUNCTION public.increment_review_helpful(p_review_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert vote record
  INSERT INTO public.review_helpful_votes (review_id, user_id)
  VALUES (p_review_id, auth.uid())
  ON CONFLICT (review_id, user_id) DO NOTHING;
  
  -- Update count on review
  UPDATE public.reviews
  SET helpful_count = (
    SELECT COUNT(*) FROM public.review_helpful_votes WHERE review_id = p_review_id
  )
  WHERE id = p_review_id;
END;
$$;