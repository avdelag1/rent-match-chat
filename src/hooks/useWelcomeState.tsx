import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * PERFORMANCE FIX: Welcome state with DB persistence
 *
 * Problem: localStorage can be reset by Lovable preview URLs, causing
 * welcome to show on every login instead of just first signup.
 *
 * Solution: Use localStorage for immediate check + update DB as backup.
 * On load, check localStorage first (instant), then verify against DB.
 *
 * The welcome should ONLY show once per user, ever.
 */
export function useWelcomeState(userId: string | undefined) {
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsChecking(false);
      return;
    }

    const checkWelcomeStatus = async () => {
      const welcomeKey = `hasSeenWelcome_${userId}`;

      // Step 1: Check localStorage (instant)
      const localHasSeen = localStorage.getItem(welcomeKey);
      if (localHasSeen === 'true') {
        // Already seen according to localStorage
        setIsChecking(false);
        setShouldShowWelcome(false);
        return;
      }

      // Step 2: Check DB as backup (for when localStorage was reset)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('created_at, onboarding_completed')
          .eq('id', userId)
          .single();

        if (profile) {
          // Check if user is "old" (created more than 10 minutes ago)
          // If so, they've definitely seen the welcome before, just localStorage was cleared
          const createdAt = new Date(profile.created_at || '');
          const now = new Date();
          const ageMs = now.getTime() - createdAt.getTime();
          const tenMinutesMs = 10 * 60 * 1000;

          if (ageMs > tenMinutesMs) {
            // User is not new - they've seen welcome before, localStorage was just cleared
            localStorage.setItem(welcomeKey, 'true');
            setIsChecking(false);
            setShouldShowWelcome(false);
            return;
          }

          // User is new (created within last 10 minutes)
          // Check if onboarding_completed is true - if so, they've been through signup
          if (profile.onboarding_completed === true) {
            // Already completed onboarding, don't show welcome again
            localStorage.setItem(welcomeKey, 'true');
            setIsChecking(false);
            setShouldShowWelcome(false);
            return;
          }
        }

        // User is new and hasn't seen welcome - show it!
        // CRITICAL: Set localStorage IMMEDIATELY before showing
        // This prevents double-showing if user refreshes
        localStorage.setItem(welcomeKey, 'true');
        setIsChecking(false);
        setShouldShowWelcome(true);

      } catch (error) {
        // On error, fallback to showing welcome only if localStorage says no
        if (!localHasSeen) {
          localStorage.setItem(welcomeKey, 'true');
          setShouldShowWelcome(true);
        }
        setIsChecking(false);
      }
    };

    checkWelcomeStatus();
  }, [userId]);

  const dismissWelcome = useCallback(() => {
    if (userId) {
      const welcomeKey = `hasSeenWelcome_${userId}`;
      localStorage.setItem(welcomeKey, 'true');
    }
    setShouldShowWelcome(false);
  }, [userId]);

  return {
    shouldShowWelcome,
    isChecking,
    dismissWelcome,
  };
}
