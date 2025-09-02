-- Create subscription packages table
CREATE TABLE IF NOT EXISTS public.subscription_packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL, -- 'free', 'silver', 'gold', 'platinum'
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'MXN',
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_properties INTEGER DEFAULT NULL, -- NULL means unlimited
  max_messages INTEGER DEFAULT NULL, -- NULL means unlimited
  max_super_likes INTEGER DEFAULT 0,
  visibility_boost DECIMAL(3,2) DEFAULT 1.0, -- 1.0 = 100% visibility
  priority_matching BOOLEAN DEFAULT false,
  analytics_access BOOLEAN DEFAULT false,
  ad_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  package_id INTEGER NOT NULL REFERENCES subscription_packages(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'cancelled', 'expired'
  stripe_subscription_id TEXT UNIQUE,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create package usage tracking table
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

-- RLS Policies for subscription_packages (public read)
CREATE POLICY "Everyone can view subscription packages" 
ON public.subscription_packages 
FOR SELECT 
USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own subscriptions" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies for package_usage
CREATE POLICY "Users can view their own usage" 
ON public.package_usage 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own usage" 
ON public.package_usage 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own usage" 
ON public.package_usage 
FOR UPDATE 
USING (user_id = auth.uid());

-- Insert initial subscription packages
INSERT INTO public.subscription_packages (name, tier, price, features, max_properties, max_messages, max_super_likes, visibility_boost, priority_matching, analytics_access, ad_free) VALUES
-- Free tier
('Free Basic', 'free', 0, '["basic_messaging", "basic_search"]', 1, 5, 0, 0.25, false, false, false),

-- Silver tier
('Silver Boost', 'silver', 99, '["unlimited_likes", "super_likes", "see_who_liked", "boost_visibility"]', 3, 15, 5, 0.5, false, false, false),

-- Gold tier  
('Gold Premium', 'gold', 199, '["unlimited_likes", "unlimited_super_likes", "priority_matching", "advanced_filters", "see_who_visited", "messaging"]', 10, 50, 999, 0.8, true, true, true),

-- Platinum tier
('Platinum VIP', 'platinum', 299, '["all_features", "unlimited_everything", "vip_support", "exclusive_events", "advanced_analytics"]', NULL, NULL, 999, 1.0, true, true, true);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_packages_updated_at 
    BEFORE UPDATE ON public.subscription_packages 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON public.user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_package_usage_updated_at 
    BEFORE UPDATE ON public.package_usage 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();