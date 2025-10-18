-- Add paypal_link column to subscription_packages
ALTER TABLE public.subscription_packages 
ADD COLUMN IF NOT EXISTS paypal_link TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_packages_paypal_link 
ON public.subscription_packages(paypal_link) 
WHERE paypal_link IS NOT NULL;

-- Update Client Pay-Per-Use Packages with PayPal links and features
UPDATE subscription_packages 
SET 
  paypal_link = 'https://www.paypal.com/ncp/payment/8WZT9P5ASWGF8',
  features = '["3 message activations", "1 best deal notification", "Valid for 30 days", "Secure transaction tools"]'
WHERE name = '3 Message Activations' AND package_category = 'client_pay_per_use';

UPDATE subscription_packages 
SET 
  paypal_link = 'https://www.paypal.com/ncp/payment/ZBEAWP7ZPUDES',
  features = '["6 message activations", "2 best deal notifications", "Valid for 60 days", "Secure transaction tools"]'
WHERE name = '6 Message Activations' AND package_category = 'client_pay_per_use';

UPDATE subscription_packages 
SET 
  paypal_link = 'https://www.paypal.com/ncp/payment/6BYXKAVE59S6E',
  features = '["10 message activations", "3 best deal notifications", "Valid for 90 days", "Secure transaction tools"]'
WHERE name = '10 Message Activations' AND package_category = 'client_pay_per_use';

-- Update Owner Pay-Per-Use Packages with PayPal links and features
UPDATE subscription_packages 
SET 
  paypal_link = 'https://www.paypal.com/ncp/payment/QAX2BL6LB58HC',
  features = '["3 outreach activations", "1 best deal notification", "Valid for 30 days", "Secure transaction tools"]'
WHERE name = '3 Outreach Activations' AND package_category = 'owner_pay_per_use';

UPDATE subscription_packages 
SET 
  paypal_link = 'https://www.paypal.com/ncp/payment/5TDR83WUKA7ZY',
  features = '["6 outreach activations", "2 best deal notifications", "Valid for 60 days", "Secure transaction tools"]'
WHERE name = '6 Outreach Activations' AND package_category = 'owner_pay_per_use';

UPDATE subscription_packages 
SET 
  paypal_link = 'https://www.paypal.com/ncp/payment/XSQUQA3UNUN4U',
  features = '["10 outreach activations", "3 best deal notifications", "Valid for 90 days", "Secure transaction tools"]'
WHERE name = '10 Outreach Activations' AND package_category = 'owner_pay_per_use';

-- Update Client Monthly Packages with updated features (PayPal subscription links to be added later)
UPDATE subscription_packages 
SET features = '["8 message activations per month", "1 legal document", "Secure transaction tools", "Monthly reset"]'
WHERE name = 'Basic Explorer';

UPDATE subscription_packages 
SET features = '["15 message activations per month", "3 legal documents", "Early access to new profiles", "Personalized match tips"]'
WHERE name = 'Multi-Matcher';

UPDATE subscription_packages 
SET features = '["25 message activations per month", "Unlimited legal documents", "Early access to all profiles", "Advanced match tips", "Priority support"]'
WHERE name = 'Ultimate Seeker';

-- Update Owner Monthly Packages with updated features
UPDATE subscription_packages 
SET features = '["5 outreach activations per month", "List up to 2 items", "1 legal document", "Secure transaction tools"]'
WHERE name = 'Starter Lister';

UPDATE subscription_packages 
SET features = '["10 outreach activations per month", "List up to 5 items", "3 legal documents", "Basic seeker insights"]'
WHERE name = 'Category Pro';

UPDATE subscription_packages 
SET features = '["15 outreach activations per month", "List up to 10 items", "5 legal documents", "Availability sync", "Advanced seeker insights"]'
WHERE name = 'Multi-Asset Manager';

UPDATE subscription_packages 
SET features = '["Unlimited outreach activations", "Unlimited listings", "Unlimited legal documents", "Market trend reports", "Priority support", "Dedicated account manager"]'
WHERE name = 'Empire Builder';