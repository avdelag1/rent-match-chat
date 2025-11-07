-- Create function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create owner_profiles table for owner business information
CREATE TABLE IF NOT EXISTS public.owner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text,
  business_description text,
  business_location text,
  contact_email text,
  contact_phone text,
  profile_images text[] DEFAULT ARRAY[]::text[],
  verified_owner boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.owner_profiles ENABLE ROW LEVEL SECURITY;

-- Owners can view and manage their own profile
CREATE POLICY "Owners can manage own profile"
  ON public.owner_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Clients can view owner profiles (for listing owners)
CREATE POLICY "Clients can view owner profiles"
  ON public.owner_profiles
  FOR SELECT
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER set_owner_profiles_updated_at
  BEFORE UPDATE ON public.owner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();