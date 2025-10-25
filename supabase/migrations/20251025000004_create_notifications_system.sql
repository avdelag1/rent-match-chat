-- Migration: Create real-time notifications system
-- Supports push notifications for matches, messages, likes, and other events

-- Create notification types enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM (
      'new_match',
      'new_message',
      'new_like',
      'new_review',
      'property_inquiry',
      'contract_signed',
      'contract_pending',
      'payment_received',
      'profile_viewed',
      'system_announcement',
      'verification_approved',
      'subscription_expiring'
    );
  END IF;
END$$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,

  -- Related entities
  related_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  related_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  related_message_id UUID,
  related_match_id UUID,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_related_user ON public.notifications(related_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (TRUE);

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = auth.uid() AND is_read = FALSE;
END;
$$;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM public.notifications
  WHERE user_id = auth.uid() AND is_read = FALSE AND is_archived = FALSE;

  RETURN unread_count;
END;
$$;

-- Create function to send notification
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_id UUID,
  p_type public.notification_type,
  p_title TEXT,
  p_message TEXT,
  p_link_url TEXT DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL,
  p_related_property_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    notification_type,
    title,
    message,
    link_url,
    related_user_id,
    related_property_id,
    metadata
  )
  VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_link_url,
    p_related_user_id,
    p_related_property_id,
    p_metadata
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;

-- Create trigger to auto-delete old notifications (keep last 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND is_archived = TRUE;
END;
$$;

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Email notifications
  email_new_match BOOLEAN DEFAULT TRUE,
  email_new_message BOOLEAN DEFAULT TRUE,
  email_new_like BOOLEAN DEFAULT TRUE,
  email_new_review BOOLEAN DEFAULT TRUE,
  email_property_inquiry BOOLEAN DEFAULT TRUE,
  email_contract_updates BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT FALSE,

  -- Push notifications
  push_new_match BOOLEAN DEFAULT TRUE,
  push_new_message BOOLEAN DEFAULT TRUE,
  push_new_like BOOLEAN DEFAULT TRUE,
  push_new_review BOOLEAN DEFAULT TRUE,
  push_property_inquiry BOOLEAN DEFAULT TRUE,

  -- In-app notifications
  inapp_all BOOLEAN DEFAULT TRUE,

  -- Frequency settings
  digest_frequency TEXT DEFAULT 'instant' CHECK (digest_frequency IN ('instant', 'daily', 'weekly', 'never')),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create default notification preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_notification_prefs ON public.profiles;
CREATE TRIGGER trg_create_notification_prefs
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_notification_preferences();

COMMENT ON TABLE public.notifications IS 'Real-time notifications for users with Supabase Realtime support';
COMMENT ON TABLE public.notification_preferences IS 'User preferences for email, push, and in-app notifications';
