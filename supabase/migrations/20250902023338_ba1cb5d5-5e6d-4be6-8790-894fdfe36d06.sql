-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;

-- Check if subscription tables exist, if not create them
CREATE TABLE IF NOT EXISTS public.subscription_packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'MXN',
  billing_period TEXT NOT NULL DEFAULT 'monthly',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_properties INTEGER DEFAULT NULL,
  max_messages INTEGER DEFAULT NULL,
  max_super_likes INTEGER DEFAULT 0,
  visibility_boost DECIMAL(3,2) DEFAULT 1.0,
  priority_matching BOOLEAN DEFAULT false,
  analytics_access BOOLEAN DEFAULT false,
  ad_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  package_id INTEGER NOT NULL REFERENCES subscription_packages(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_subscription_id TEXT UNIQUE,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.package_usage (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  properties_posted_this_month INTEGER DEFAULT 0,
  messages_sent_this_week INTEGER DEFAULT 0,
  super_likes_used_this_month INTEGER DEFAULT 0,
  last_reset_properties TIMESTAMPTZ DEFAULT now(),
  last_reset_messages TIMESTAMPTZ DEFAULT now(),
  last_reset_super_likes TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_usage ENABLE ROW LEVEL SECURITY;

-- Create fresh RLS policies
CREATE POLICY "view_subscription_packages" 
ON public.subscription_packages 
FOR SELECT 
USING (true);

CREATE POLICY "view_own_subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "create_own_subscriptions" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "view_own_usage" 
ON public.package_usage 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "create_own_usage" 
ON public.package_usage 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_usage" 
ON public.package_usage 
FOR UPDATE 
USING (user_id = auth.uid());

-- Insert packages only if table is empty
INSERT INTO public.subscription_packages (name, tier, price, features, max_properties, max_messages, max_super_likes, visibility_boost, priority_matching, analytics_access, ad_free) 
SELECT * FROM (VALUES
  ('Free Basic', 'free', 0, '["basic_messaging", "basic_search"]'::jsonb, 1, 5, 0, 0.25, false, false, false),
  ('Silver Boost', 'silver', 99, '["unlimited_likes", "super_likes", "see_who_liked", "boost_visibility"]'::jsonb, 3, 15, 5, 0.5, false, false, false),
  ('Gold Premium', 'gold', 199, '["unlimited_likes", "unlimited_super_likes", "priority_matching", "advanced_filters", "see_who_visited", "messaging"]'::jsonb, 10, 50, 999, 0.8, true, true, true),
  ('Platinum VIP', 'platinum', 299, '["all_features", "unlimited_everything", "vip_support", "exclusive_events", "advanced_analytics"]'::jsonb, NULL, NULL, 999, 1.0, true, true, true)
) AS v(name, tier, price, features, max_properties, max_messages, max_super_likes, visibility_boost, priority_matching, analytics_access, ad_free)
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_packages);