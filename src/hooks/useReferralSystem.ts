import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { STORAGE, REFERRAL } from '@/constants/app';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/prodLogger';

/**
 * Referral System Hook
 * Handles capturing referral codes from URLs and granting rewards
 */
export function useReferralSystem() {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Capture referral code from URL parameters
  const captureReferralFromUrl = useCallback(() => {
    const urlParams = new URLSearchParams(location.search);
    const refCode = urlParams.get('ref');

    if (refCode && refCode.length > 0) {
      // Don't capture if user is already logged in (they can't use their own referral)
      if (user && user.id === refCode) {
        return null;
      }

      // Store referral code with timestamp
      const referralData = {
        code: refCode,
        capturedAt: Date.now(),
        source: location.pathname,
      };

      localStorage.setItem(STORAGE.REFERRAL_CODE_KEY, JSON.stringify(referralData));

      if (import.meta.env.DEV) {
        logger.log('[Referral] Captured referral code:', refCode);
      }

      return refCode;
    }
    return null;
  }, [location.search, location.pathname, user]);

  // Get stored referral code (if valid)
  const getStoredReferralCode = useCallback((): string | null => {
    try {
      const stored = localStorage.getItem(STORAGE.REFERRAL_CODE_KEY);
      if (!stored) return null;

      const referralData = JSON.parse(stored);
      const capturedAt = referralData.capturedAt || 0;
      const expiryMs = REFERRAL.REFERRAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      // Check if expired
      if (Date.now() - capturedAt > expiryMs) {
        localStorage.removeItem(STORAGE.REFERRAL_CODE_KEY);
        return null;
      }

      return referralData.code || null;
    } catch {
      return null;
    }
  }, []);

  // Clear stored referral code
  const clearReferralCode = useCallback(() => {
    localStorage.removeItem(STORAGE.REFERRAL_CODE_KEY);
  }, []);

  // Grant referral reward to referrer (1 free message activation)
  const grantReferralReward = useCallback(async (referrerId: string, newUserId: string): Promise<boolean> => {
    try {
      // Validate referrer exists and is not the same as new user
      if (!referrerId || referrerId === newUserId) {
        return false;
      }

      // Check if this referral has already been rewarded (prevent abuse)
      const { data: existingReward } = await supabase
        .from('message_activations')
        .select('id')
        .eq('user_id', referrerId)
        .eq('activation_type', 'referral_bonus')
        .like('notes', `%referred_user:${newUserId}%`)
        .maybeSingle();

      if (existingReward) {
        if (import.meta.env.DEV) {
          logger.log('[Referral] Reward already granted for this referral');
        }
        return false;
      }

      // Check if referrer has reached max referral messages
      const { data: totalReferralActivations } = await supabase
        .from('message_activations')
        .select('remaining_activations')
        .eq('user_id', referrerId)
        .eq('activation_type', 'referral_bonus')
        .gt('remaining_activations', 0);

      const totalRemaining = (totalReferralActivations || [])
        .reduce((sum, act) => sum + (act.remaining_activations || 0), 0);

      if (totalRemaining >= REFERRAL.MAX_REFERRAL_MESSAGES) {
        if (import.meta.env.DEV) {
          logger.log('[Referral] Referrer has reached max referral messages');
        }
        return false;
      }

      // Create referral bonus activation
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60); // 60 days expiry for referral bonus

      const { error: activError } = await supabase
        .from('message_activations')
        .insert({
          user_id: referrerId,
          activation_type: 'referral_bonus',
          total_activations: REFERRAL.FREE_MESSAGES_PER_REFERRAL,
          remaining_activations: REFERRAL.FREE_MESSAGES_PER_REFERRAL,
          used_activations: 0,
          expires_at: expiresAt.toISOString(),
          notes: `Referral reward - referred_user:${newUserId}`,
        });

      if (activError) {
        logger.error('[Referral] Failed to create activation:', activError);
        return false;
      }

      // Create notification for referrer (silent, non-blocking)
      supabase
        .from('notifications')
        .insert([{
          id: crypto.randomUUID(),
          user_id: referrerId,
          type: 'referral_reward',
          message: 'You earned 1 free message for inviting a new user!',
          read: false,
        }])
        .then(() => {});
        // Ignore notification errors - reward is still granted

      if (import.meta.env.DEV) {
        logger.log('[Referral] Reward granted to referrer:', referrerId);
      }

      return true;
    } catch (error) {
      logger.error('[Referral] Error granting reward:', error);
      return false;
    }
  }, []);

  // Process referral on signup (called after successful user registration)
  const processReferralOnSignup = useCallback(async (newUserId: string) => {
    const referrerId = getStoredReferralCode();

    if (!referrerId || referrerId === newUserId) {
      clearReferralCode();
      return;
    }

    // Verify referrer exists
    const { data: referrerProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', referrerId)
      .maybeSingle();

    if (!referrerProfile) {
      clearReferralCode();
      return;
    }

    // Grant reward
    const success = await grantReferralReward(referrerId, newUserId);

    // Clear referral code regardless of success (prevent reuse)
    clearReferralCode();

    // Invalidate queries for the referrer (they'll see updated activations)
    queryClient.invalidateQueries({ queryKey: ['message-activations', referrerId] });

    if (success && import.meta.env.DEV) {
      logger.log('[Referral] Successfully processed referral signup');
    }
  }, [getStoredReferralCode, clearReferralCode, grantReferralReward, queryClient]);

  // Auto-capture referral code from URL on mount
  useEffect(() => {
    captureReferralFromUrl();
  }, [captureReferralFromUrl]);

  return {
    captureReferralFromUrl,
    getStoredReferralCode,
    clearReferralCode,
    grantReferralReward,
    processReferralOnSignup,
  };
}

/**
 * Generate a referral URL with the user's ID
 */
export function generateReferralUrl(userId: string, path?: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://swipess.com';
  const targetPath = path || '/';
  const separator = targetPath.includes('?') ? '&' : '?';
  return `${baseUrl}${targetPath}${separator}ref=${userId}`;
}
