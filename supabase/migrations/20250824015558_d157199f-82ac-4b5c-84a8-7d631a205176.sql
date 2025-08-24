
-- 1) Create enum user_role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('client', 'owner', 'admin');
  END IF;
END$$;

-- 2) Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'client',
  name text,
  bio text,
  age integer,
  gender text,
  interests text[],
  profile_photo text,
  subscription_tier text NOT NULL DEFAULT 'free',
  verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) RLS policies (users manage only their own profile)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END$$;

-- 4) updated_at trigger
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_profiles_updated_at'
  ) THEN
    CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();
  END IF;
END$$;

-- 5) On new auth user, auto-insert into profiles using raw_user_meta_data.role (fallback to 'client')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.user_role := 'client';
BEGIN
  -- Read role from auth user metadata if present
  IF NEW.raw_user_meta_data ? 'role' THEN
    _role := COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'client');
  END IF;

  INSERT INTO public.profiles (id, role, name, profile_photo, verified, subscription_tier)
  VALUES (NEW.id, _role, NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'profile_photo', false, 'free')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END$$;

-- 6) RPC to set or correct the role after login (enforces self-only)
CREATE OR REPLACE FUNCTION public.set_user_role(p_role public.user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.profiles
  SET role = p_role
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, role)
    VALUES (auth.uid(), p_role);
  END IF;
END;
$$;
