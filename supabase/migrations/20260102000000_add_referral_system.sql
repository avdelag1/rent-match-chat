-- Migration: Add Referral System Tables
-- This migration creates tables for managing referral codes and rewards

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code VARCHAR(12) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    total_referrals INTEGER DEFAULT 0,
    CONSTRAINT unique_user_referral_code UNIQUE (user_id)
);

-- Create referrals table to track who referred whom
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code_id UUID NOT NULL REFERENCES public.referral_codes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    referrer_reward_claimed BOOLEAN DEFAULT FALSE,
    referred_reward_claimed BOOLEAN DEFAULT FALSE,
    referrer_reward_claimed_at TIMESTAMPTZ,
    referred_reward_claimed_at TIMESTAMPTZ,
    CONSTRAINT unique_referral UNIQUE (referred_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral code"
    ON public.referral_codes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral code"
    ON public.referral_codes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view referral codes by code for validation"
    ON public.referral_codes FOR SELECT
    USING (is_active = TRUE);

-- RLS Policies for referrals
CREATE POLICY "Users can view referrals they made or received"
    ON public.referrals FOR SELECT
    USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
    ON public.referrals FOR INSERT
    WITH CHECK (auth.uid() = referred_id);

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(12) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result VARCHAR(12) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create a user's referral code
CREATE OR REPLACE FUNCTION get_or_create_referral_code(p_user_id UUID)
RETURNS TABLE(code VARCHAR(12), total_referrals INTEGER) AS $$
DECLARE
    v_code VARCHAR(12);
    v_total INTEGER;
BEGIN
    -- Try to get existing code
    SELECT rc.code, rc.total_referrals INTO v_code, v_total
    FROM public.referral_codes rc
    WHERE rc.user_id = p_user_id;

    -- If no code exists, create one
    IF v_code IS NULL THEN
        -- Generate unique code
        LOOP
            v_code := generate_referral_code();
            BEGIN
                INSERT INTO public.referral_codes (user_id, code)
                VALUES (p_user_id, v_code);
                v_total := 0;
                EXIT;
            EXCEPTION WHEN unique_violation THEN
                -- Code already exists, try again
                CONTINUE;
            END;
        END LOOP;
    END IF;

    RETURN QUERY SELECT v_code, v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process a referral and grant rewards
CREATE OR REPLACE FUNCTION process_referral(
    p_referral_code VARCHAR(12),
    p_referred_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_referral_code_record RECORD;
    v_referral_id UUID;
    v_referrer_activation_id UUID;
    v_referred_activation_id UUID;
BEGIN
    -- Get the referral code record
    SELECT * INTO v_referral_code_record
    FROM public.referral_codes
    WHERE code = p_referral_code AND is_active = TRUE;

    IF v_referral_code_record IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
    END IF;

    -- Check if user is trying to use their own code
    IF v_referral_code_record.user_id = p_referred_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot use your own referral code');
    END IF;

    -- Check if user already has a referrer
    IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = p_referred_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'User already has a referrer');
    END IF;

    -- Create the referral record
    INSERT INTO public.referrals (referrer_id, referred_id, referral_code_id)
    VALUES (v_referral_code_record.user_id, p_referred_user_id, v_referral_code_record.id)
    RETURNING id INTO v_referral_id;

    -- Update total referrals count
    UPDATE public.referral_codes
    SET total_referrals = total_referrals + 1
    WHERE id = v_referral_code_record.id;

    -- Grant 1 free message activation to referrer
    INSERT INTO public.message_activations (
        user_id,
        activation_type,
        total_activations,
        used_activations,
        expires_at,
        source
    )
    VALUES (
        v_referral_code_record.user_id,
        'referral_bonus',
        1,
        0,
        NOW() + INTERVAL '1 year',
        'referral_reward'
    )
    RETURNING id INTO v_referrer_activation_id;

    -- Grant 1 free message activation to referred user
    INSERT INTO public.message_activations (
        user_id,
        activation_type,
        total_activations,
        used_activations,
        expires_at,
        source
    )
    VALUES (
        p_referred_user_id,
        'referral_bonus',
        1,
        0,
        NOW() + INTERVAL '1 year',
        'referral_welcome'
    )
    RETURNING id INTO v_referred_activation_id;

    -- Mark rewards as claimed
    UPDATE public.referrals
    SET
        referrer_reward_claimed = TRUE,
        referred_reward_claimed = TRUE,
        referrer_reward_claimed_at = NOW(),
        referred_reward_claimed_at = NOW()
    WHERE id = v_referral_id;

    RETURN jsonb_build_object(
        'success', true,
        'referral_id', v_referral_id,
        'referrer_activation_id', v_referrer_activation_id,
        'referred_activation_id', v_referred_activation_id,
        'message', 'Referral processed successfully! Both users received 1 free message activation.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add source column to message_activations if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'message_activations' AND column_name = 'source'
    ) THEN
        ALTER TABLE public.message_activations ADD COLUMN source VARCHAR(50);
    END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_or_create_referral_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION process_referral(VARCHAR, UUID) TO authenticated;
