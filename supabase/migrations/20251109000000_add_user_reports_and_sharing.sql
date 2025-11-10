-- Migration: Add user reports and sharing features
-- Date: 2025-11-09
-- Description: Add tables for reporting users/listings and tracking shares

-- ============================================================================
-- USER REPORTS TABLE
-- ============================================================================
-- For reporting inappropriate users, fake profiles, brokers, etc.

CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reporter info
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Reported entity (can be user OR listing)
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,

  -- Report details
  report_type TEXT NOT NULL CHECK (report_type IN (
    'fake_profile',           -- Pretending to be someone else
    'not_real_owner',         -- Claiming to own property they don't
    'broker_posing_as_client', -- Broker pretending to be renter
    'broker_posing_as_owner',  -- Broker pretending to be owner
    'inappropriate_content',   -- Offensive photos/text
    'harassment',             -- Harassing behavior
    'spam',                   -- Spam or advertising
    'scam',                   -- Fraudulent activity
    'fake_listing',           -- Fake property listing
    'misleading_info',        -- Misleading or false information
    'other'                   -- Other issues
  )),

  report_category TEXT NOT NULL CHECK (report_category IN (
    'user_profile',
    'listing',
    'message',
    'review'
  )),

  -- Description from reporter
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- Screenshots or proof

  -- Admin handling
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'under_review',
    'resolved',
    'dismissed',
    'action_taken'
  )),

  admin_id UUID REFERENCES public.profiles(id),
  admin_notes TEXT,
  admin_action TEXT, -- What action was taken
  reviewed_at TIMESTAMPTZ,

  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT must_report_user_or_listing CHECK (
    (reported_user_id IS NOT NULL AND reported_listing_id IS NULL) OR
    (reported_user_id IS NULL AND reported_listing_id IS NOT NULL)
  )
);

-- Indexes for user_reports
CREATE INDEX idx_user_reports_reporter ON public.user_reports(reporter_id);
CREATE INDEX idx_user_reports_reported_user ON public.user_reports(reported_user_id) WHERE reported_user_id IS NOT NULL;
CREATE INDEX idx_user_reports_reported_listing ON public.user_reports(reported_listing_id) WHERE reported_listing_id IS NOT NULL;
CREATE INDEX idx_user_reports_status ON public.user_reports(status);
CREATE INDEX idx_user_reports_created_at ON public.user_reports(created_at DESC);
CREATE INDEX idx_user_reports_priority ON public.user_reports(priority) WHERE status = 'pending';

-- Updated_at trigger
CREATE TRIGGER update_user_reports_updated_at
  BEFORE UPDATE ON public.user_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CONTENT SHARES TABLE
-- ============================================================================
-- Track when users share listings or profiles with friends

CREATE TABLE IF NOT EXISTS public.content_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who shared
  sharer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- What was shared (listing OR profile)
  shared_listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  shared_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Share details
  share_method TEXT NOT NULL CHECK (share_method IN (
    'link_copied',    -- Copied link to clipboard
    'email',          -- Shared via email
    'whatsapp',       -- Shared via WhatsApp
    'facebook',       -- Shared via Facebook
    'twitter',        -- Shared via Twitter
    'sms',            -- Shared via SMS
    'other'           -- Other method
  )),

  -- Optional: track who received it (if internal referral)
  recipient_email TEXT,
  recipient_phone TEXT,

  -- Tracking
  share_url TEXT, -- Generated share URL
  clicks_count INT DEFAULT 0,
  conversions_count INT DEFAULT 0, -- How many led to signups/contacts

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT must_share_listing_or_profile CHECK (
    (shared_listing_id IS NOT NULL AND shared_profile_id IS NULL) OR
    (shared_listing_id IS NULL AND shared_profile_id IS NOT NULL)
  )
);

-- Indexes for content_shares
CREATE INDEX idx_content_shares_sharer ON public.content_shares(sharer_id);
CREATE INDEX idx_content_shares_listing ON public.content_shares(shared_listing_id) WHERE shared_listing_id IS NOT NULL;
CREATE INDEX idx_content_shares_profile ON public.content_shares(shared_profile_id) WHERE shared_profile_id IS NOT NULL;
CREATE INDEX idx_content_shares_created_at ON public.content_shares(created_at DESC);
CREATE INDEX idx_content_shares_method ON public.content_shares(share_method);

-- ============================================================================
-- RLS POLICIES - user_reports
-- ============================================================================

-- Enable RLS
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON public.user_reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON public.user_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON public.user_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports"
  ON public.user_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- RLS POLICIES - content_shares
-- ============================================================================

-- Enable RLS
ALTER TABLE public.content_shares ENABLE ROW LEVEL SECURITY;

-- Users can view their own shares
CREATE POLICY "Users can view their own shares"
  ON public.content_shares
  FOR SELECT
  USING (auth.uid() = sharer_id);

-- Users can create shares
CREATE POLICY "Users can create shares"
  ON public.content_shares
  FOR INSERT
  WITH CHECK (auth.uid() = sharer_id);

-- Profile owners can see how many times their content was shared
CREATE POLICY "Content owners can see share stats"
  ON public.content_shares
  FOR SELECT
  USING (
    (shared_listing_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = shared_listing_id AND owner_id = auth.uid()
    ))
    OR
    (shared_profile_id IS NOT NULL AND shared_profile_id = auth.uid())
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has already reported a specific user/listing
CREATE OR REPLACE FUNCTION public.has_user_already_reported(
  p_reporter_id UUID,
  p_reported_user_id UUID DEFAULT NULL,
  p_reported_listing_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_reports
    WHERE reporter_id = p_reporter_id
      AND (
        (reported_user_id = p_reported_user_id AND p_reported_user_id IS NOT NULL)
        OR
        (reported_listing_id = p_reported_listing_id AND p_reported_listing_id IS NOT NULL)
      )
      AND status IN ('pending', 'under_review')
      AND created_at > now() - INTERVAL '30 days' -- Only check last 30 days
  );
END;
$$;

-- Function to get report statistics for admins
CREATE OR REPLACE FUNCTION public.get_report_statistics()
RETURNS TABLE (
  total_reports BIGINT,
  pending_reports BIGINT,
  under_review_reports BIGINT,
  resolved_reports BIGINT,
  dismissed_reports BIGINT,
  high_priority_reports BIGINT,
  urgent_priority_reports BIGINT,
  reports_last_24h BIGINT,
  reports_last_7d BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins to call this
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can view report statistics';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_reports,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT AS pending_reports,
    COUNT(*) FILTER (WHERE status = 'under_review')::BIGINT AS under_review_reports,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT AS resolved_reports,
    COUNT(*) FILTER (WHERE status = 'dismissed')::BIGINT AS dismissed_reports,
    COUNT(*) FILTER (WHERE priority = 'high')::BIGINT AS high_priority_reports,
    COUNT(*) FILTER (WHERE priority = 'urgent')::BIGINT AS urgent_priority_reports,
    COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '24 hours')::BIGINT AS reports_last_24h,
    COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days')::BIGINT AS reports_last_7d
  FROM public.user_reports;
END;
$$;

-- Function to increment share clicks
CREATE OR REPLACE FUNCTION public.increment_share_clicks(p_share_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.content_shares
  SET clicks_count = clicks_count + 1
  WHERE id = p_share_id;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.user_reports IS 'Reports of inappropriate users, fake profiles, and problematic listings';
COMMENT ON TABLE public.content_shares IS 'Tracks when users share listings or profiles with others';

COMMENT ON COLUMN public.user_reports.report_type IS 'Type of issue being reported';
COMMENT ON COLUMN public.user_reports.status IS 'Current status of the report';
COMMENT ON COLUMN public.user_reports.priority IS 'Priority level assigned by admin or system';

COMMENT ON COLUMN public.content_shares.share_method IS 'How the content was shared';
COMMENT ON COLUMN public.content_shares.clicks_count IS 'Number of times the shared link was clicked';
COMMENT ON COLUMN public.content_shares.conversions_count IS 'Number of signups/contacts from this share';
