-- Create function to grant 5 free message activations to new users
CREATE OR REPLACE FUNCTION public.grant_welcome_message_activations()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires when new user is created
DROP TRIGGER IF EXISTS grant_welcome_activations_trigger ON auth.users;
CREATE TRIGGER grant_welcome_activations_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_welcome_message_activations();