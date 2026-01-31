-- ============================================
-- FIX MISSING COLUMNS - Unblocks signup
-- Date: 2026-01-31
--
-- The handle_new_user trigger (20260131025500) references
-- onboarding_completed on profiles, but the column was never
-- created in any migration.  Every signup attempt fires the
-- trigger, hits the missing column, and rolls back the entire
-- auth.users INSERT.  Same story for the notes column on
-- message_activations used by the welcome-activation logic.
-- ============================================

-- 1. Add onboarding_completed to profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE public.profiles
            ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- Existing profiles are already set up; mark them complete so
-- they keep appearing in swipe decks without any visible change.
UPDATE public.profiles
SET onboarding_completed = TRUE
WHERE onboarding_completed = FALSE;

-- 2. Add notes to message_activations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'message_activations' AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.message_activations
            ADD COLUMN notes TEXT;
    END IF;
END $$;
