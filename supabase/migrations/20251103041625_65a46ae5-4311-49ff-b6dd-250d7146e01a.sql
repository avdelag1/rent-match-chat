-- Grant 5 free message activations to all existing users
INSERT INTO public.message_activations (
  user_id,
  activation_type,
  total_activations,
  used_activations,
  expires_at
)
SELECT 
  id as user_id,
  'pay_per_use' as activation_type,
  5 as total_activations,
  0 as used_activations,
  (NOW() + INTERVAL '90 days') as expires_at
FROM auth.users
WHERE id NOT IN (
  SELECT DISTINCT user_id 
  FROM public.message_activations 
  WHERE activation_type = 'pay_per_use'
  AND expires_at > NOW()
);