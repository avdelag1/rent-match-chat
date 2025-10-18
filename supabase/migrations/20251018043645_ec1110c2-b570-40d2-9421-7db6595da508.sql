-- =====================================================
-- PHASE 1: SIMPLIFIED PREMIUM PACKAGE SYSTEM (FIXED)
-- Message Activations & Legal Documents Focus
-- =====================================================

-- First, update the tier constraint to include new tiers
ALTER TABLE public.subscription_packages DROP CONSTRAINT IF EXISTS subscription_packages_tier_check;
ALTER TABLE public.subscription_packages ADD CONSTRAINT subscription_packages_tier_check 
CHECK (tier IN ('free', 'basic', 'premium', 'premium_plus', 'unlimited', 'pay_per_use'));

-- =====================================================
-- 1. Message Activations System
-- =====================================================

CREATE TABLE IF NOT EXISTS public.message_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activation_type TEXT NOT NULL CHECK (activation_type IN ('pay_per_use', 'monthly_subscription')),
  total_activations INTEGER NOT NULL DEFAULT 0,
  used_activations INTEGER NOT NULL DEFAULT 0,
  remaining_activations INTEGER GENERATED ALWAYS AS (total_activations - used_activations) STORED,
  expires_at TIMESTAMP WITH TIME ZONE,
  reset_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.message_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activations"
ON public.message_activations FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own activations"
ON public.message_activations FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.activation_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activation_id UUID REFERENCES public.message_activations(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  activation_context TEXT CHECK (activation_context IN ('new_conversation', 'outreach'))
);

ALTER TABLE public.activation_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage logs"
ON public.activation_usage_log FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_message_activations_user_expiry 
ON public.message_activations(user_id, expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activation_usage_user 
ON public.activation_usage_log(user_id, used_at);

-- =====================================================
-- 2. Update Subscription Packages
-- =====================================================

ALTER TABLE public.subscription_packages ADD COLUMN IF NOT EXISTS package_category TEXT 
CHECK (package_category IN ('client_monthly', 'owner_monthly', 'client_pay_per_use', 'owner_pay_per_use'));

ALTER TABLE public.subscription_packages ADD COLUMN IF NOT EXISTS message_activations INTEGER DEFAULT 0;
ALTER TABLE public.subscription_packages ADD COLUMN IF NOT EXISTS legal_documents_included INTEGER DEFAULT 0;
ALTER TABLE public.subscription_packages ADD COLUMN IF NOT EXISTS best_deal_notifications INTEGER DEFAULT 0;
ALTER TABLE public.subscription_packages ADD COLUMN IF NOT EXISTS max_listings INTEGER DEFAULT 0;
ALTER TABLE public.subscription_packages ADD COLUMN IF NOT EXISTS duration_days INTEGER;
ALTER TABLE public.subscription_packages ADD COLUMN IF NOT EXISTS early_profile_access BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subscription_packages ADD COLUMN IF NOT EXISTS advanced_match_tips BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subscription_packages ADD COLUMN IF NOT EXISTS seeker_insights BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subscription_packages ADD COLUMN IF NOT EXISTS availability_sync BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subscription_packages ADD COLUMN IF NOT EXISTS market_reports BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 3. Legal Documents & Notifications
-- =====================================================

CREATE TABLE IF NOT EXISTS public.legal_document_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  monthly_limit INTEGER DEFAULT 0,
  used_this_month INTEGER DEFAULT 0,
  reset_date DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.legal_document_quota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quota"
ON public.legal_document_quota FOR ALL TO authenticated
USING (auth.uid() = user_id);

ALTER TABLE public.legal_documents ADD COLUMN IF NOT EXISTS paid_separately BOOLEAN DEFAULT FALSE;
ALTER TABLE public.legal_documents ADD COLUMN IF NOT EXISTS cost NUMERIC(10, 2) DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.best_deal_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notifications_available INTEGER DEFAULT 0,
  reset_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.best_deal_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications quota"
ON public.best_deal_notifications FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- 4. Seed Packages
-- =====================================================

INSERT INTO public.subscription_packages (name, tier, package_category, price, message_activations, best_deal_notifications, duration_days, legal_documents_included, features, is_active) VALUES
('3 Message Activations', 'pay_per_use', 'client_pay_per_use', 99, 3, 1, 30, 0, '["3 message activations", "1 best deal notification", "Valid for 30 days"]', TRUE),
('6 Message Activations', 'pay_per_use', 'client_pay_per_use', 180, 6, 2, 60, 0, '["6 message activations", "2 best deal notifications", "Valid for 60 days"]', TRUE),
('10 Message Activations', 'pay_per_use', 'client_pay_per_use', 230, 10, 3, 90, 0, '["10 message activations", "3 best deal notifications", "Valid for 90 days"]', TRUE),
('Basic Explorer', 'basic', 'client_monthly', 99, 8, 1, NULL, 1, '["8 message activations/month", "1 legal document", "Secure tools"]', TRUE),
('Multi-Matcher', 'premium', 'client_monthly', 199, 15, 3, NULL, 3, '["15 activations/month", "3 legal docs", "Early access", "Match tips"]', TRUE),
('Ultimate Seeker', 'unlimited', 'client_monthly', 299, 25, 0, NULL, 0, '["25 activations/month", "Unlimited legal docs", "Full access"]', TRUE),
('3 Outreach Activations', 'pay_per_use', 'owner_pay_per_use', 99, 3, 1, 30, 0, '["3 outreach activations", "1 notification", "30 days"]', TRUE),
('6 Outreach Activations', 'pay_per_use', 'owner_pay_per_use', 180, 6, 2, 60, 0, '["6 outreach activations", "2 notifications", "60 days"]', TRUE),
('10 Outreach Activations', 'pay_per_use', 'owner_pay_per_use', 230, 10, 3, 90, 0, '["10 outreach activations", "3 notifications", "90 days"]', TRUE),
('Starter Lister', 'basic', 'owner_monthly', 129, 5, 0, NULL, 1, '["5 activations/month", "2 listings", "1 legal doc"]', TRUE),
('Category Pro', 'premium', 'owner_monthly', 229, 10, 0, NULL, 3, '["10 activations/month", "5 listings", "3 legal docs", "Insights"]', TRUE),
('Multi-Asset Manager', 'premium_plus', 'owner_monthly', 329, 15, 0, NULL, 5, '["15 activations/month", "10 listings", "5 legal docs", "Sync"]', TRUE),
('Empire Builder', 'unlimited', 'owner_monthly', 429, 0, 0, NULL, 0, '["Unlimited activations", "Unlimited listings", "Unlimited docs", "Reports"]', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Update seeded packages with additional fields
UPDATE public.subscription_packages SET 
  early_profile_access = TRUE, 
  advanced_match_tips = TRUE 
WHERE name IN ('Multi-Matcher', 'Ultimate Seeker');

UPDATE public.subscription_packages SET 
  max_listings = 2 WHERE name = 'Starter Lister';
UPDATE public.subscription_packages SET 
  max_listings = 5, seeker_insights = TRUE WHERE name = 'Category Pro';
UPDATE public.subscription_packages SET 
  max_listings = 10, seeker_insights = TRUE, availability_sync = TRUE WHERE name = 'Multi-Asset Manager';
UPDATE public.subscription_packages SET 
  max_listings = 0, seeker_insights = TRUE, availability_sync = TRUE, market_reports = TRUE WHERE name = 'Empire Builder';

-- =====================================================
-- 5. Helper Functions
-- =====================================================

CREATE OR REPLACE FUNCTION public.reset_monthly_message_activations()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.message_activations SET used_activations = 0, updated_at = now(),
    reset_date = DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
  WHERE activation_type = 'monthly_subscription' AND reset_date <= CURRENT_DATE;
END; $$;

CREATE OR REPLACE FUNCTION public.reset_monthly_legal_quotas()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.legal_document_quota SET used_this_month = 0, updated_at = now(),
    reset_date = DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
  WHERE reset_date <= CURRENT_DATE;
END; $$;

CREATE OR REPLACE FUNCTION public.update_message_activations_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER message_activations_updated_at
BEFORE UPDATE ON public.message_activations FOR EACH ROW
EXECUTE FUNCTION public.update_message_activations_timestamp();