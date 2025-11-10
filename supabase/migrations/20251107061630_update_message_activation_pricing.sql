-- =====================================================
-- Update Message Activation Pricing
-- Implementing new pricing structure based on requirements
-- =====================================================

-- Update existing pay-per-use packages with new pricing
-- Client packages: 3 msgs (60 MXN), 5 msgs (99 MXN), 10 msgs (139 MXN)
UPDATE public.subscription_packages 
SET price = 60, message_activations = 3
WHERE package_category = 'client_pay_per_use' AND message_activations = 3;

UPDATE public.subscription_packages 
SET name = '5 Message Activations', price = 99, message_activations = 5, 
    features = '["5 message activations", "2 best deal notifications", "Valid for 60 days"]'
WHERE package_category = 'client_pay_per_use' AND message_activations = 6;

UPDATE public.subscription_packages 
SET price = 139
WHERE package_category = 'client_pay_per_use' AND message_activations = 10;

-- Owner packages: 3 msgs (40 MXN), 5 msgs (80 MXN), 10 msgs (119 MXN)
UPDATE public.subscription_packages 
SET price = 40, message_activations = 3
WHERE package_category = 'owner_pay_per_use' AND message_activations = 3;

UPDATE public.subscription_packages 
SET name = '5 Outreach Activations', price = 80, message_activations = 5,
    features = '["5 outreach activations", "2 notifications", "60 days"]'
WHERE package_category = 'owner_pay_per_use' AND message_activations = 6;

UPDATE public.subscription_packages 
SET price = 119
WHERE package_category = 'owner_pay_per_use' AND message_activations = 10;

-- Insert new 5-message packages if the updates didn't affect any rows
-- (in case the database was reset or doesn't have the 6-message packages)
INSERT INTO public.subscription_packages 
  (name, tier, package_category, price, message_activations, best_deal_notifications, duration_days, legal_documents_included, features, is_active)
SELECT 
  '5 Message Activations', 
  'pay_per_use', 
  'client_pay_per_use', 
  99, 
  5, 
  2, 
  60, 
  0, 
  '["5 message activations", "2 best deal notifications", "Valid for 60 days"]',
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscription_packages 
  WHERE package_category = 'client_pay_per_use' AND message_activations = 5
);

INSERT INTO public.subscription_packages 
  (name, tier, package_category, price, message_activations, best_deal_notifications, duration_days, legal_documents_included, features, is_active)
SELECT 
  '5 Outreach Activations', 
  'pay_per_use', 
  'owner_pay_per_use', 
  80, 
  5, 
  2, 
  60, 
  0, 
  '["5 outreach activations", "2 notifications", "60 days"]',
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscription_packages 
  WHERE package_category = 'owner_pay_per_use' AND message_activations = 5
);

-- Delete old 6-message packages if they still exist with old pricing
DELETE FROM public.subscription_packages 
WHERE package_category IN ('client_pay_per_use', 'owner_pay_per_use') 
  AND message_activations = 6 
  AND price NOT IN (99, 80);

-- =====================================================
-- Update Welcome Activations from 5 to 3
-- =====================================================

-- Recreate the welcome activation function to grant 3 free activations
CREATE OR REPLACE FUNCTION public.grant_welcome_message_activations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Grant 3 free message activations with 90 day expiry (updated from 5)
  INSERT INTO public.message_activations (
    user_id,
    activation_type,
    total_activations,
    used_activations,
    expires_at
  ) VALUES (
    NEW.id,
    'pay_per_use',
    3,  -- Changed from 5 to 3
    0,
    NOW() + INTERVAL '90 days'
  );
  
  RETURN NEW;
END;
$$;
