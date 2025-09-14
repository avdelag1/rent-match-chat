-- Fix signup issues by creating a trigger to handle user profile creation
-- This trigger will automatically create a profile when a user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile for new user with role from user metadata
  INSERT INTO public.profiles (
    id, 
    role, 
    full_name, 
    email,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'), -- Default to client if no role
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    false
  );
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a function to update onboarding completion
CREATE OR REPLACE FUNCTION public.complete_user_onboarding(
  user_id UUID,
  onboarding_data JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Update the user's profile with onboarding data
  UPDATE public.profiles 
  SET 
    onboarding_completed = true,
    -- Update fields based on the onboarding data
    age = CASE WHEN onboarding_data->>'age' IS NOT NULL THEN (onboarding_data->>'age')::integer ELSE age END,
    bio = COALESCE(onboarding_data->>'bio', bio),
    occupation = COALESCE(onboarding_data->>'occupation', occupation),
    interests = CASE WHEN onboarding_data->'interests' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(onboarding_data->'interests')) ELSE interests END,
    lifestyle_tags = CASE WHEN onboarding_data->'lifestyle_tags' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(onboarding_data->'lifestyle_tags')) ELSE lifestyle_tags END,
    preferred_property_types = CASE WHEN onboarding_data->'preferred_property_types' IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(onboarding_data->'preferred_property_types')) ELSE preferred_property_types END,
    budget_min = CASE WHEN onboarding_data->>'budget_min' IS NOT NULL THEN (onboarding_data->>'budget_min')::numeric ELSE budget_min END,
    budget_max = CASE WHEN onboarding_data->>'budget_max' IS NOT NULL THEN (onboarding_data->>'budget_max')::numeric ELSE budget_max END,
    has_pets = CASE WHEN onboarding_data->>'has_pets' IS NOT NULL THEN (onboarding_data->>'has_pets')::boolean ELSE has_pets END,
    smoking = CASE WHEN onboarding_data->>'smoking' IS NOT NULL THEN (onboarding_data->>'smoking')::boolean ELSE smoking END
  WHERE id = user_id;
END;
$$;