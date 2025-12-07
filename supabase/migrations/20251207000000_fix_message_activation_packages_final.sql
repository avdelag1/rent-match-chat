-- =====================================================
-- Fix Message Activation Packages - FINAL CLEANUP
-- This migration ensures exactly 3 packages per user type
-- with correct pricing and deletes all duplicates
-- =====================================================

-- First, completely remove ALL pay-per-use packages to start fresh
DELETE FROM public.subscription_packages
WHERE package_category IN ('client_pay_per_use', 'owner_pay_per_use');

-- =====================================================
-- CLIENT PACKAGES (3 total)
-- PayPal URLs are hardcoded in the application code
-- =====================================================

-- Client Package 1: 3 Message Activations - $50 MXN
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
);

-- Client Package 2: 10 Message Activations - $99 MXN
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
);

-- Client Package 3: 15 Message Activations - $149 MXN
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
);

-- =====================================================
-- OWNER PACKAGES (3 total)
-- PayPal URLs are hardcoded in the application code
-- =====================================================

-- Owner Package 1: 3 Outreach Activations - $35 MXN
INSERT INTO public.subscription_packages
  (name, tier, package_category, price, message_activations, best_deal_notifications, duration_days, legal_documents_included, features, is_active)
VALUES (
  '3 Message Activations',
  'pay_per_use',
  'owner_pay_per_use',
  35,
  3,
  0,
  90,
  0,
  '["3 message activations", "Unlimited messages per conversation", "90-day validity"]',
  TRUE
);

-- Owner Package 2: 10 Outreach Activations - $85 MXN
INSERT INTO public.subscription_packages
  (name, tier, package_category, price, message_activations, best_deal_notifications, duration_days, legal_documents_included, features, is_active)
VALUES (
  '10 Message Activations',
  'pay_per_use',
  'owner_pay_per_use',
  85,
  10,
  0,
  90,
  0,
  '["10 message activations", "Unlimited messages per conversation", "90-day validity"]',
  TRUE
);

-- Owner Package 3: 15 Outreach Activations - $129 MXN
INSERT INTO public.subscription_packages
  (name, tier, package_category, price, message_activations, best_deal_notifications, duration_days, legal_documents_included, features, is_active)
VALUES (
  '15 Message Activations',
  'pay_per_use',
  'owner_pay_per_use',
  129,
  15,
  0,
  90,
  0,
  '["15 message activations", "Unlimited messages per conversation", "90-day validity"]',
  TRUE
);

-- =====================================================
-- VERIFICATION QUERY (can be run manually to verify)
-- SELECT package_category, name, price, message_activations, is_active
-- FROM public.subscription_packages
-- WHERE package_category IN ('client_pay_per_use', 'owner_pay_per_use')
-- ORDER BY package_category, message_activations;
-- =====================================================
