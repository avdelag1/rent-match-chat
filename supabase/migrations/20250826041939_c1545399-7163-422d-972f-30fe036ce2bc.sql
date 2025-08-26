
-- Create swipes table to track user interactions
CREATE TABLE public.swipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'profile')),
  direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription_packages table
CREATE TABLE public.subscription_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'owner', 'universal')),
  price DECIMAL(10,2) NOT NULL,
  billing_period TEXT NOT NULL DEFAULT 'monthly',
  features JSONB DEFAULT '[]',
  paypal_plan_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  package_id UUID REFERENCES public.subscription_packages NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  paypal_subscription_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update profiles table to include subscription info
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'premium_plus', 'unlimited', 'vip')),
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Enable RLS for new tables
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for swipes
CREATE POLICY "Users can view their own swipes" ON public.swipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own swipes" ON public.swipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for subscription_packages (public read)
CREATE POLICY "Anyone can view subscription packages" ON public.subscription_packages
  FOR SELECT USING (true);

-- RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_swipes_user_target ON public.swipes(user_id, target_id, target_type);
CREATE INDEX idx_user_subscriptions_user_status ON public.user_subscriptions(user_id, status);
CREATE INDEX idx_listings_status ON public.listings(status) WHERE status = 'active';

-- Insert default subscription packages
INSERT INTO public.subscription_packages (name, role, price, features) VALUES
('Premium Client', 'client', 29.99, '["messaging", "basic_filters"]'),
('Premium++ Client', 'client', 49.99, '["messaging", "advanced_filters", "priority_support"]'),
('Unlimited Client', 'client', 79.99, '["messaging", "advanced_filters", "priority_support", "unlimited_swipes"]'),
('Premium Owner', 'owner', 39.99, '["unlimited_listings", "basic_analytics"]'),
('Premium++ Owner', 'owner', 69.99, '["unlimited_listings", "advanced_analytics", "priority_listing"]'),
('Unlimited Owner', 'owner', 99.99, '["unlimited_listings", "advanced_analytics", "priority_listing", "verification_badge"]'),
('VIP Package', 'universal', 149.99, '["all_features", "priority_support", "verification_badge", "exclusive_access"]');

-- Enable realtime for messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
