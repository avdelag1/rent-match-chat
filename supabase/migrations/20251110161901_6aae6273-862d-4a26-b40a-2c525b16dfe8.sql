-- Create profile views tracking table for smart recycling system
CREATE TABLE IF NOT EXISTS public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  viewed_profile_id uuid NOT NULL,
  view_type text NOT NULL CHECK (view_type IN ('profile', 'listing')),
  action text NOT NULL CHECK (action IN ('like', 'pass', 'view')),
  created_at timestamptz DEFAULT now() NOT NULL,
  
  CONSTRAINT unique_view UNIQUE(user_id, viewed_profile_id, view_type)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profile_views_user_created ON public.profile_views(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_user_profile ON public.profile_views(user_id, viewed_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_action ON public.profile_views(user_id, action, created_at DESC);

-- Enable RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile views"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile views"
  ON public.profile_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile views"
  ON public.profile_views FOR UPDATE
  USING (auth.uid() = user_id);