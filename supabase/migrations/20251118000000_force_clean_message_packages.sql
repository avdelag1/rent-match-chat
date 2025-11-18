-- =====================================================
-- CLEAN SLATE: Delete and recreate ONLY the 3 packages per side
-- This migration completely removes old packages and creates fresh ones
-- =====================================================

-- STEP 1: Delete ALL existing pay-per-use packages (fresh start)
DELETE FROM public.subscription_packages
WHERE package_category IN ('client_pay_per_use', 'owner_pay_per_use');

-- =====================================================
-- CLIENT PACKAGES - EXACTLY 3
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
);

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
);

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
);

-- =====================================================
-- OWNER PACKAGES - EXACTLY 3
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
);

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
);

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
);

-- =====================================================
-- VERIFICATION: Count packages (should be exactly 3 per side)
-- =====================================================
DO $$
DECLARE
  client_count INTEGER;
  owner_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO client_count
  FROM public.subscription_packages
  WHERE package_category = 'client_pay_per_use' AND is_active = TRUE;

  SELECT COUNT(*) INTO owner_count
  FROM public.subscription_packages
  WHERE package_category = 'owner_pay_per_use' AND is_active = TRUE;

  RAISE NOTICE 'Client packages: %, Owner packages: %', client_count, owner_count;

  IF client_count != 3 OR owner_count != 3 THEN
    RAISE EXCEPTION 'Package count mismatch! Expected 3 per side. Client: %, Owner: %', client_count, owner_count;
  END IF;
END $$;
