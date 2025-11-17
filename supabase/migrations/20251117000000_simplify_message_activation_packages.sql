-- =====================================================
-- Simplify Message Activation Packages
-- Update to 3 simple packages per user type
-- =====================================================

-- Deactivate ALL existing pay-per-use packages to start fresh
UPDATE public.subscription_packages
SET is_active = FALSE
WHERE package_category IN ('client_pay_per_use', 'owner_pay_per_use');

-- =====================================================
-- CLIENT PACKAGES
-- =====================================================

-- Package 1: 3 Message Activations - 50 MXN
INSERT INTO public.subscription_packages
  (name, tier, package_category, price, message_activations, best_deal_notifications, duration_days, legal_documents_included, features, is_active)
VALUES (
  '3 Message Activations',
  'pay_per_use',
  'client_pay_per_use',
  50,
  3,
  0,
  90,
  0,
  '["3 message activations", "Unlimited messages per conversation", "90-day validity"]',
  TRUE
)
ON CONFLICT DO NOTHING;

-- Package 2: 10 Message Activations - 99 MXN
INSERT INTO public.subscription_packages
  (name, tier, package_category, price, message_activations, best_deal_notifications, duration_days, legal_documents_included, features, is_active)
VALUES (
  '10 Message Activations',
  'pay_per_use',
  'client_pay_per_use',
  99,
  10,
  0,
  90,
  0,
  '["10 message activations", "Unlimited messages per conversation", "90-day validity"]',
  TRUE
)
ON CONFLICT DO NOTHING;

-- Package 3: 15 Message Activations - 149 MXN
INSERT INTO public.subscription_packages
  (name, tier, package_category, price, message_activations, best_deal_notifications, duration_days, legal_documents_included, features, is_active)
VALUES (
  '15 Message Activations',
  'pay_per_use',
  'client_pay_per_use',
  149,
  15,
  0,
  90,
  0,
  '["15 message activations", "Unlimited messages per conversation", "90-day validity"]',
  TRUE
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- OWNER PACKAGES
-- =====================================================

-- Package 1: 3 Outreach Activations - 35 MXN
INSERT INTO public.subscription_packages
  (name, tier, package_category, price, message_activations, best_deal_notifications, duration_days, legal_documents_included, features, is_active)
VALUES (
  '3 Outreach Activations',
  'pay_per_use',
  'owner_pay_per_use',
  35,
  3,
  0,
  90,
  0,
  '["3 outreach activations", "Unlimited messages per conversation", "90-day validity"]',
  TRUE
)
ON CONFLICT DO NOTHING;

-- Package 2: 10 Outreach Activations - 85 MXN
INSERT INTO public.subscription_packages
  (name, tier, package_category, price, message_activations, best_deal_notifications, duration_days, legal_documents_included, features, is_active)
VALUES (
  '10 Outreach Activations',
  'pay_per_use',
  'owner_pay_per_use',
  85,
  10,
  0,
  90,
  0,
  '["10 outreach activations", "Unlimited messages per conversation", "90-day validity"]',
  TRUE
)
ON CONFLICT DO NOTHING;

-- Package 3: 15 Outreach Activations - 129 MXN
INSERT INTO public.subscription_packages
  (name, tier, package_category, price, message_activations, best_deal_notifications, duration_days, legal_documents_included, features, is_active)
VALUES (
  '15 Outreach Activations',
  'pay_per_use',
  'owner_pay_per_use',
  129,
  15,
  0,
  90,
  0,
  '["15 outreach activations", "Unlimited messages per conversation", "90-day validity"]',
  TRUE
)
ON CONFLICT DO NOTHING;
