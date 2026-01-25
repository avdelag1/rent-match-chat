-- ============================================================================
-- OWNER LIKES AND BACKGROUND CHECK SYSTEM
-- ============================================================================
-- Date: 2026-01-25
-- Purpose: Create owner_likes table and add background check/criminal record fields
-- This migration:
--   1. Creates owner_likes table for owners to like client profiles
--   2. Adds criminal_record and background_check fields to profiles
--   3. Sets up RLS policies for owner_likes table
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE OWNER_LIKES TABLE
-- ============================================================================

-- Create owner_likes table to store owner likes on client profiles
CREATE TABLE IF NOT EXISTS public.owner_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT owner_likes_unique UNIQUE (owner_id, client_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_owner_likes_owner_id ON public.owner_likes(owner_id);
CREATE INDEX IF NOT EXISTS idx_owner_likes_client_id ON public.owner_likes(client_id);
CREATE INDEX IF NOT EXISTS idx_owner_likes_created_at ON public.owner_likes(created_at DESC);

-- Enable RLS
ALTER TABLE public.owner_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for owner_likes

-- Policy 1: Owners can read their own likes
CREATE POLICY "owners can read their own likes"
ON public.owner_likes
FOR SELECT
USING (auth.uid() = owner_id);

-- Policy 2: Owners can insert likes
CREATE POLICY "owners can insert likes"
ON public.owner_likes
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id
  AND public.is_user_active(auth.uid())
);

-- Policy 3: Owners can delete their own likes
CREATE POLICY "owners can delete their own likes"
ON public.owner_likes
FOR DELETE
USING (auth.uid() = owner_id);

-- Policy 4: Clients can see who liked them (optional - comment out if privacy is a concern)
CREATE POLICY "clients can see who liked them"
ON public.owner_likes
FOR SELECT
USING (auth.uid() = client_id);

-- Add table comment
COMMENT ON TABLE public.owner_likes IS
'Stores owner likes on client profiles. Allows owners to save and track potential clients they are interested in.';

COMMENT ON COLUMN public.owner_likes.id IS 'Unique identifier for the like';
COMMENT ON COLUMN public.owner_likes.owner_id IS 'Owner who liked the client (references auth.users)';
COMMENT ON COLUMN public.owner_likes.client_id IS 'Client who was liked (references auth.users)';
COMMENT ON COLUMN public.owner_likes.created_at IS 'When the like was created';

-- ============================================================================
-- PART 2: ADD BACKGROUND CHECK AND CRIMINAL RECORD FIELDS TO PROFILES
-- ============================================================================

-- Add criminal record tracking fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_criminal_record BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS criminal_record_type TEXT,
ADD COLUMN IF NOT EXISTS criminal_record_details JSONB,
ADD COLUMN IF NOT EXISTS background_check_status TEXT DEFAULT 'not_checked',
ADD COLUMN IF NOT EXISTS background_check_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS background_check_verified_by TEXT;

-- Add constraint to ensure background_check_status has valid values
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_background_check_status_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_background_check_status_check
CHECK (background_check_status IN ('not_checked', 'pending', 'passed', 'failed', 'expired'));

-- Add comments for new fields
COMMENT ON COLUMN public.profiles.has_criminal_record IS
'Indicates if the user has a criminal record. Used for filtering in owner searches.';

COMMENT ON COLUMN public.profiles.criminal_record_type IS
'Type of criminal record (e.g., "vehicle_theft", "yacht_theft", "property_damage", etc.)';

COMMENT ON COLUMN public.profiles.criminal_record_details IS
'JSON object containing details about criminal record, including date, jurisdiction, severity, etc.';

COMMENT ON COLUMN public.profiles.background_check_status IS
'Status of background check: not_checked, pending, passed, failed, or expired';

COMMENT ON COLUMN public.profiles.background_check_date IS
'Date when the background check was last performed';

COMMENT ON COLUMN public.profiles.background_check_verified_by IS
'Name or ID of the service/person who verified the background check';

-- ============================================================================
-- PART 3: CREATE HELPER VIEW FOR OWNER LIKED CLIENTS
-- ============================================================================

-- Create a view that makes it easy for owners to see their liked clients with full profile info
CREATE OR REPLACE VIEW public.owner_liked_clients AS
SELECT
  ol.id as like_id,
  ol.created_at as liked_at,
  ol.owner_id,
  ol.client_id,
  p.full_name,
  p.age,
  p.bio,
  p.occupation,
  p.nationality,
  p.interests,
  p.images,
  p.verified,
  p.has_criminal_record,
  p.criminal_record_type,
  p.background_check_status,
  p.background_check_date,
  p.monthly_income,
  p.location
FROM public.owner_likes ol
JOIN public.profiles p ON p.id = ol.client_id;

-- Add RLS to the view
ALTER VIEW public.owner_liked_clients SET (security_invoker = true);

COMMENT ON VIEW public.owner_liked_clients IS
'View showing clients that owners have liked, with full profile info including background check status.
Owners can query this to see their liked clients and filter by background check status.';

-- ============================================================================
-- PART 4: CREATE FUNCTION TO AUTOMATICALLY FILTER OUT PROBLEMATIC CLIENTS
-- ============================================================================

-- Function to check if a client has problematic background
CREATE OR REPLACE FUNCTION public.is_client_safe(client_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_profile RECORD;
BEGIN
  SELECT
    has_criminal_record,
    criminal_record_type,
    background_check_status
  INTO client_profile
  FROM public.profiles
  WHERE id = client_user_id;

  -- Return false (not safe) if:
  -- 1. Has criminal record
  -- 2. Background check failed
  -- 3. Has specific problematic criminal record types
  IF client_profile.has_criminal_record = true THEN
    RETURN false;
  END IF;

  IF client_profile.background_check_status = 'failed' THEN
    RETURN false;
  END IF;

  IF client_profile.criminal_record_type IN (
    'vehicle_theft',
    'yacht_theft',
    'property_damage',
    'fraud',
    'violence',
    'theft'
  ) THEN
    RETURN false;
  END IF;

  -- Otherwise, client is safe
  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.is_client_safe(UUID) IS
'Checks if a client has a safe background (no criminal record, passed background check).
Returns false if client has criminal record or failed background check.';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'OWNER LIKES AND BACKGROUND CHECK SYSTEM SETUP COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'New Table: owner_likes';
  RAISE NOTICE '  - owner_likes.id (UUID, PK)';
  RAISE NOTICE '  - owner_likes.owner_id (UUID, FK -> auth.users)';
  RAISE NOTICE '  - owner_likes.client_id (UUID, FK -> auth.users)';
  RAISE NOTICE '  - owner_likes.created_at (TIMESTAMPTZ)';
  RAISE NOTICE '  - UNIQUE(owner_id, client_id)';
  RAISE NOTICE '';
  RAISE NOTICE 'New Profile Fields:';
  RAISE NOTICE '  - has_criminal_record (BOOLEAN)';
  RAISE NOTICE '  - criminal_record_type (TEXT)';
  RAISE NOTICE '  - criminal_record_details (JSONB)';
  RAISE NOTICE '  - background_check_status (TEXT)';
  RAISE NOTICE '  - background_check_date (TIMESTAMPTZ)';
  RAISE NOTICE '  - background_check_verified_by (TEXT)';
  RAISE NOTICE '';
  RAISE NOTICE 'New View: owner_liked_clients';
  RAISE NOTICE '  Shows liked clients with background check info';
  RAISE NOTICE '';
  RAISE NOTICE 'New Function: is_client_safe(UUID)';
  RAISE NOTICE '  Filters out clients with criminal records';
  RAISE NOTICE '============================================================';
END $$;
