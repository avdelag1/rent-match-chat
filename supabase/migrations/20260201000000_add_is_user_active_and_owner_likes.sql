-- ============================================
-- Add is_user_active() function and owner_likes table
--
-- is_user_active() is referenced by RLS policies but was never
-- defined in migrations.  It returns TRUE for new users who don't
-- have a profile yet so they can interact immediately after signup.
--
-- owner_likes tracks likes that owners place on client profiles.
-- The app references this table but it was never created in
-- migrations.
-- ============================================

-- ============================================
-- is_user_active() function
-- ============================================

CREATE OR REPLACE FUNCTION public.is_user_active(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (
      SELECT
        NOT COALESCE(is_suspended, false)
        AND NOT COALESCE(is_blocked, false)
      FROM public.profiles
      WHERE id = user_uuid
    ),
    -- No profile yet → allow the user through (new signups)
    true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_user_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_active(UUID) TO anon;

-- ============================================
-- owner_likes table
-- ============================================

CREATE TABLE IF NOT EXISTS public.owner_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_owner_likes_owner ON public.owner_likes(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_likes_client ON public.owner_likes(client_id);

ALTER TABLE public.owner_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners can read their own likes"
ON public.owner_likes
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "owners can insert likes"
ON public.owner_likes
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id
  AND public.is_user_active(auth.uid())
);

CREATE POLICY "owners can delete their own likes"
ON public.owner_likes
FOR DELETE
USING (auth.uid() = owner_id);

CREATE POLICY "clients can see who liked them"
ON public.owner_likes
FOR SELECT
USING (auth.uid() = client_id);

GRANT SELECT, INSERT, DELETE ON public.owner_likes TO authenticated;
