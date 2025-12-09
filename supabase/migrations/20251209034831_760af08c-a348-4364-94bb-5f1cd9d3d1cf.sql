-- First, mark all existing pay-per-use packages as inactive
UPDATE public.subscription_packages 
SET is_active = false 
WHERE package_category IN ('client_pay_per_use', 'owner_pay_per_use');

-- Insert exactly 3 Client packages with UNIQUE names matching PayPal
INSERT INTO public.subscription_packages (name, tier, package_category, price, message_activations, legal_documents_included, duration_days, features, is_active, paypal_link)
VALUES 
  ('Client Starter - 3 Messages', 'pay_per_use', 'client_pay_per_use', 50, 3, 0, 30, 
   '["3 message activations", "30 days validity", "Unlimited messages per conversation", "Secure PayPal payment"]'::jsonb, 
   true, 'https://www.paypal.com/ncp/payment/VNM2QVBFG6TA4'),
  ('Client Standard - 10 Messages', 'pay_per_use', 'client_pay_per_use', 99, 10, 1, 60, 
   '["10 message activations", "60 days validity", "1 legal document included", "Unlimited messages per conversation", "Best value - save 34%"]'::jsonb, 
   true, 'https://www.paypal.com/ncp/payment/VG2C7QMAC8N6A'),
  ('Client Premium - 15 Messages', 'pay_per_use', 'client_pay_per_use', 149, 15, 2, 90, 
   '["15 message activations", "90 days validity", "2 legal documents included", "Unlimited messages per conversation", "Most popular - save 40%"]'::jsonb, 
   true, 'https://www.paypal.com/ncp/payment/9NBGA9X3BJ5UA');

-- Insert exactly 3 Owner packages with UNIQUE names matching PayPal
INSERT INTO public.subscription_packages (name, tier, package_category, price, message_activations, legal_documents_included, duration_days, features, is_active, paypal_link)
VALUES 
  ('Owner Starter - 3 Messages', 'pay_per_use', 'owner_pay_per_use', 35, 3, 0, 30, 
   '["3 message activations", "30 days validity", "Unlimited messages per conversation", "Secure PayPal payment"]'::jsonb, 
   true, 'https://www.paypal.com/ncp/payment/JDDDXHS82XKCC'),
  ('Owner Standard - 10 Messages', 'pay_per_use', 'owner_pay_per_use', 85, 10, 1, 60, 
   '["10 message activations", "60 days validity", "1 legal document included", "Unlimited messages per conversation", "Best value - save 29%"]'::jsonb, 
   true, 'https://www.paypal.com/ncp/payment/HHDPG2RK7WVXQ'),
  ('Owner Premium - 15 Messages', 'pay_per_use', 'owner_pay_per_use', 129, 15, 2, 90, 
   '["15 message activations", "90 days validity", "2 legal documents included", "Unlimited messages per conversation", "Most popular - save 38%"]'::jsonb, 
   true, 'https://www.paypal.com/ncp/payment/PELAQDVWVFPBL');