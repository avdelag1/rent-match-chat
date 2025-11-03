-- Fix search_path for welcome message activations function
CREATE OR REPLACE FUNCTION public.grant_welcome_message_activations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Grant 5 free message activations with 90 day expiry
  INSERT INTO public.message_activations (
    user_id,
    activation_type,
    total_activations,
    used_activations,
    expires_at
  ) VALUES (
    NEW.id,
    'pay_per_use',
    5,
    0,
    NOW() + INTERVAL '90 days'
  );
  
  RETURN NEW;
END;
$$;