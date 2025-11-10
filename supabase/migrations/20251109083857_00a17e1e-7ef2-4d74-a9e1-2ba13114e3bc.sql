-- Add 6 new message activation packages (3 client + 3 owner)
-- Using unique names to avoid conflicts

-- INSERT NEW CLIENT PACKAGES
INSERT INTO subscription_packages (
  name,
  tier,
  package_category,
  price,
  message_activations,
  legal_documents_included,
  duration_days,
  features,
  is_active,
  best_deal_notifications
) VALUES
-- Client: 5 activations @ 99 MXN
(
  'Client Starter - 5 Activations',
  'pay_per_use',
  'client_pay_per_use',
  99.00,
  5,
  0,
  30,
  '["5 message activations", "Unlimited messages per conversation", "Valid for 30 days", "Secure transaction tools"]'::jsonb,
  true,
  1
),
-- Client: 10 activations @ 149 MXN
(
  'Client Plus - 10 Activations',
  'pay_per_use',
  'client_pay_per_use',
  149.00,
  10,
  0,
  60,
  '["10 message activations", "Unlimited messages per conversation", "Valid for 60 days", "Secure transaction tools", "Priority support"]'::jsonb,
  true,
  2
),
-- Client: 15 activations @ 189 MXN
(
  'Client Premium - 15 Activations',
  'pay_per_use',
  'client_pay_per_use',
  189.00,
  15,
  0,
  90,
  '["15 message activations", "Unlimited messages per conversation", "Valid for 90 days", "Secure transaction tools", "Priority support", "Best value!"]'::jsonb,
  true,
  3
),

-- INSERT NEW OWNER PACKAGES (10 pesos less)
-- Owner: 5 activations @ 89 MXN
(
  'Owner Starter - 5 Activations',
  'pay_per_use',
  'owner_pay_per_use',
  89.00,
  5,
  0,
  30,
  '["5 outreach activations", "Unlimited messages per conversation", "Valid for 30 days", "Secure transaction tools"]'::jsonb,
  true,
  1
),
-- Owner: 10 activations @ 139 MXN
(
  'Owner Plus - 10 Activations',
  'pay_per_use',
  'owner_pay_per_use',
  139.00,
  10,
  0,
  60,
  '["10 outreach activations", "Unlimited messages per conversation", "Valid for 60 days", "Secure transaction tools", "Priority support"]'::jsonb,
  true,
  2
),
-- Owner: 15 activations @ 179 MXN
(
  'Owner Premium - 15 Activations',
  'pay_per_use',
  'owner_pay_per_use',
  179.00,
  15,
  0,
  90,
  '["15 outreach activations", "Unlimited messages per conversation", "Valid for 90 days", "Secure transaction tools", "Priority support", "Best value!"]'::jsonb,
  true,
  3
)
ON CONFLICT (name) DO NOTHING;