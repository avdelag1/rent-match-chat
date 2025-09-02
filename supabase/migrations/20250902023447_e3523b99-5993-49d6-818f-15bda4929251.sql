-- Add missing columns to subscription_packages table
ALTER TABLE public.subscription_packages 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'MXN',
ADD COLUMN IF NOT EXISTS billing_period TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS max_messages INTEGER,
ADD COLUMN IF NOT EXISTS max_super_likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS visibility_boost DECIMAL(3,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS priority_matching BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS analytics_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ad_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Update existing features for better subscription tiers
UPDATE public.subscription_packages SET 
  features = '["basic_messaging", "basic_search"]'::jsonb,
  max_messages = 5,
  max_super_likes = 0,
  visibility_boost = 0.25,
  priority_matching = false,
  analytics_access = false,
  ad_free = false
WHERE tier = 'free';

-- Insert or update premium tiers
INSERT INTO public.subscription_packages (name, tier, price, features, max_property_listings, max_messages, max_super_likes, visibility_boost, priority_matching, analytics_access, ad_free) 
VALUES 
  ('Silver Boost', 'silver', 99.00, '["unlimited_likes", "super_likes", "see_who_liked", "boost_visibility"]'::jsonb, 3, 15, 5, 0.50, false, false, false),
  ('Gold Premium', 'gold', 199.00, '["unlimited_likes", "unlimited_super_likes", "priority_matching", "advanced_filters", "see_who_visited", "messaging"]'::jsonb, 10, 50, 999, 0.80, true, true, true),
  ('Platinum VIP', 'platinum', 299.00, '["all_features", "unlimited_everything", "vip_support", "exclusive_events", "advanced_analytics"]'::jsonb, NULL, NULL, 999, 1.0, true, true, true)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  max_property_listings = EXCLUDED.max_property_listings,
  max_messages = EXCLUDED.max_messages,
  max_super_likes = EXCLUDED.max_super_likes,
  visibility_boost = EXCLUDED.visibility_boost,
  priority_matching = EXCLUDED.priority_matching,
  analytics_access = EXCLUDED.analytics_access,
  ad_free = EXCLUDED.ad_free;