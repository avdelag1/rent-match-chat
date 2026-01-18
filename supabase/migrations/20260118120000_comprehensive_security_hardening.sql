-- ============================================================================
-- COMPREHENSIVE SECURITY HARDENING MIGRATION
-- ============================================================================
-- Date: 2026-01-18
-- Purpose: Add admin moderation, rate limiting, and enhanced security
-- Related Docs: docs/SECURITY_HARDENING_MASTER_GUIDE.md
-- ============================================================================

-- ============================================================================
-- PART 1: ADD ADMIN MODERATION FIELDS TO PROFILES
-- ============================================================================

-- Add moderation columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES public.admin_users(id),
ADD COLUMN IF NOT EXISTS suspension_expires_at TIMESTAMPTZ,

ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS block_reason TEXT,
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES public.admin_users(id),

ADD COLUMN IF NOT EXISTS is_read_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS read_only_reason TEXT,

ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_request_reason TEXT,
ADD COLUMN IF NOT EXISTS deletion_approved_by UUID REFERENCES public.admin_users(id),
ADD COLUMN IF NOT EXISTS deletion_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_rejected_by UUID REFERENCES public.admin_users(id),
ADD COLUMN IF NOT EXISTS deletion_rejected_at TIMESTAMPTZ;

-- Add indexes for moderation queries
CREATE INDEX IF NOT EXISTS idx_profiles_moderation
  ON public.profiles(is_suspended, is_blocked, is_read_only)
  WHERE is_suspended = true OR is_blocked = true OR is_read_only = true;

CREATE INDEX IF NOT EXISTS idx_profiles_deletion_requests
  ON public.profiles(deletion_requested_at)
  WHERE deletion_requested_at IS NOT NULL
  AND deletion_approved_at IS NULL
  AND deletion_rejected_at IS NULL;

-- ============================================================================
-- PART 2: ADMIN MODERATION ACTIONS AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  admin_user_id UUID NOT NULL REFERENCES public.admin_users(id),
  admin_email TEXT NOT NULL,
  admin_role TEXT NOT NULL,

  -- What action was performed
  action_type TEXT NOT NULL, -- 'suspend', 'unsuspend', 'block', 'unblock', 'delete_request_approve', etc.
  target_type TEXT NOT NULL, -- 'user', 'listing', 'message', 'review', etc.
  target_id UUID NOT NULL,

  -- Why
  reason TEXT NOT NULL,
  details JSONB DEFAULT '{}',

  -- When
  performed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Where (IP tracking)
  ip_address TEXT,
  user_agent TEXT,

  -- Additional context
  previous_state JSONB,
  new_state JSONB,

  -- Reversal tracking
  is_reversed BOOLEAN DEFAULT false,
  reversed_by UUID REFERENCES public.admin_users(id),
  reversed_at TIMESTAMPTZ,
  reversal_reason TEXT
);

-- Enable RLS
ALTER TABLE public.admin_moderation_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
DROP POLICY IF EXISTS "admins_view_moderation_logs" ON public.admin_moderation_actions;
CREATE POLICY "admins_view_moderation_logs"
  ON public.admin_moderation_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
      AND role IN ('admin', 'super_admin')
    )
  );

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_moderation_actions_admin
  ON public.admin_moderation_actions(admin_user_id, performed_at DESC);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_target
  ON public.admin_moderation_actions(target_type, target_id, performed_at DESC);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_type
  ON public.admin_moderation_actions(action_type, performed_at DESC);

COMMENT ON TABLE public.admin_moderation_actions IS
  'Comprehensive audit log of all admin moderation actions with full context';

-- ============================================================================
-- PART 3: USER DELETION REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,

  -- Request details
  reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),

  -- Review
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES public.admin_users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Deletion execution
  deleted_at TIMESTAMPTZ,
  deletion_executed_by UUID REFERENCES public.admin_users(id)
);

-- Enable RLS
ALTER TABLE public.user_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own deletion request
DROP POLICY IF EXISTS "users_view_own_deletion_request" ON public.user_deletion_requests;
CREATE POLICY "users_view_own_deletion_request"
  ON public.user_deletion_requests FOR SELECT
  USING (user_id = auth.uid());

-- Users can create deletion requests
DROP POLICY IF EXISTS "users_create_deletion_request" ON public.user_deletion_requests;
CREATE POLICY "users_create_deletion_request"
  ON public.user_deletion_requests FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
  );

-- Admins can view all deletion requests
DROP POLICY IF EXISTS "admins_view_deletion_requests" ON public.user_deletion_requests;
CREATE POLICY "admins_view_deletion_requests"
  ON public.user_deletion_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- Admins can update deletion requests
DROP POLICY IF EXISTS "admins_update_deletion_requests" ON public.user_deletion_requests;
CREATE POLICY "admins_update_deletion_requests"
  ON public.user_deletion_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
      AND role IN ('admin', 'super_admin')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status
  ON public.user_deletion_requests(status, requested_at DESC);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_user
  ON public.user_deletion_requests(user_id);

COMMENT ON TABLE public.user_deletion_requests IS
  'User-initiated deletion requests that require admin approval';

-- ============================================================================
-- PART 4: API RATE LIMITING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifier (user_id OR ip_address)
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  endpoint TEXT NOT NULL,

  -- Rate limit tracking
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  window_duration_seconds INTEGER DEFAULT 60, -- 1 minute window

  -- Metadata
  user_agent TEXT,
  last_request_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_endpoint_window UNIQUE (user_id, endpoint, window_start),
  CONSTRAINT unique_ip_endpoint_window UNIQUE (ip_address, endpoint, window_start)
);

-- Enable RLS (only service role can access)
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies - service role only

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint
  ON public.api_rate_limits(user_id, endpoint, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint
  ON public.api_rate_limits(ip_address, endpoint, window_start DESC);

-- Cleanup old windows (hourly cron job)
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup
  ON public.api_rate_limits(window_start)
  WHERE window_start < NOW() - INTERVAL '1 hour';

COMMENT ON TABLE public.api_rate_limits IS
  'Track API request rates per user and IP for rate limiting';

-- ============================================================================
-- PART 5: DEVICE SESSION TRACKING (ANTI-BOT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  request_count INTEGER DEFAULT 1,
  suspicious_activity_score NUMERIC DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  blocked_reason TEXT,

  CONSTRAINT unique_device_user UNIQUE (device_fingerprint, user_id)
);

-- Enable RLS
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
DROP POLICY IF EXISTS "users_view_own_sessions" ON public.device_sessions;
CREATE POLICY "users_view_own_sessions"
  ON public.device_sessions FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all sessions
DROP POLICY IF EXISTS "admins_view_all_sessions" ON public.device_sessions;
CREATE POLICY "admins_view_all_sessions"
  ON public.device_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- Index for suspicious activity queries
CREATE INDEX IF NOT EXISTS idx_device_sessions_suspicious
  ON public.device_sessions(suspicious_activity_score DESC, last_seen_at DESC)
  WHERE suspicious_activity_score > 50;

CREATE INDEX IF NOT EXISTS idx_device_sessions_user
  ON public.device_sessions(user_id, last_seen_at DESC);

COMMENT ON TABLE public.device_sessions IS
  'Track device sessions for suspicious behavior detection';

-- ============================================================================
-- PART 6: HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is active (not suspended/blocked)
CREATE OR REPLACE FUNCTION public.is_user_active(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    NOT COALESCE(is_suspended, false)
    AND NOT COALESCE(is_blocked, false)
  FROM public.profiles
  WHERE id = user_uuid;
$$;

COMMENT ON FUNCTION public.is_user_active IS
  'Check if user is active (not suspended or blocked)';

-- Function to log device session
CREATE OR REPLACE FUNCTION public.log_device_session(
  device_fingerprint_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Upsert device session
  INSERT INTO public.device_sessions (
    user_id,
    device_fingerprint,
    ip_address,
    user_agent,
    request_count,
    last_seen_at
  ) VALUES (
    current_user_id,
    device_fingerprint_param,
    current_setting('request.headers', true)::json->>'cf-connecting-ip',
    current_setting('request.headers', true)::json->>'user-agent',
    1,
    NOW()
  )
  ON CONFLICT (device_fingerprint, user_id)
  DO UPDATE SET
    request_count = device_sessions.request_count + 1,
    last_seen_at = NOW();
END;
$$;

COMMENT ON FUNCTION public.log_device_session IS
  'Log or update device session for current user';

-- ============================================================================
-- PART 7: AUTO-EXPIRE SUSPENSIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.expire_suspensions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.profiles
  SET
    is_suspended = false,
    suspension_reason = NULL,
    suspended_at = NULL,
    suspended_by = NULL,
    suspension_expires_at = NULL
  WHERE is_suspended = true
    AND suspension_expires_at IS NOT NULL
    AND suspension_expires_at <= NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;

  RAISE NOTICE 'Auto-expired % suspensions', expired_count;

  RETURN expired_count;
END;
$$;

COMMENT ON FUNCTION public.expire_suspensions IS
  'Auto-expire temporary suspensions (run hourly via cron)';

-- ============================================================================
-- PART 8: ENHANCED RLS FOR CRITICAL TABLES
-- ============================================================================

-- Ensure messages can only be sent by active users
DROP POLICY IF EXISTS "conversation_messages_insert_active_users" ON public.conversation_messages;
CREATE POLICY "conversation_messages_insert_active_users"
  ON public.conversation_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_user_active(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.client_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

COMMENT ON POLICY "conversation_messages_insert_active_users" ON public.conversation_messages IS
  'Only active (not suspended/blocked) users can send messages';

-- Ensure likes can only be created by active users
DROP POLICY IF EXISTS "likes_insert_active_users" ON public.likes;
CREATE POLICY "likes_insert_active_users"
  ON public.likes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_user_active(auth.uid())
  );

COMMENT ON POLICY "likes_insert_active_users" ON public.likes IS
  'Only active users can swipe/like';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'COMPREHENSIVE SECURITY HARDENING COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Added:';
  RAISE NOTICE '  1. Admin moderation fields to profiles';
  RAISE NOTICE '  2. admin_moderation_actions audit log';
  RAISE NOTICE '  3. user_deletion_requests table';
  RAISE NOTICE '  4. api_rate_limits table';
  RAISE NOTICE '  5. device_sessions tracking';
  RAISE NOTICE '  6. Helper functions (is_user_active, log_device_session)';
  RAISE NOTICE '  7. Auto-expire suspensions function';
  RAISE NOTICE '  8. Enhanced RLS for active user checks';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  - Deploy Edge Functions (see docs/)';
  RAISE NOTICE '  - Implement admin UI components';
  RAISE NOTICE '  - Configure Cloudflare rate limiting';
  RAISE NOTICE '  - Test all moderation flows';
  RAISE NOTICE '============================================================';
END $$;
