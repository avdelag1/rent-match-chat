import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * SPEED OF LIGHT: Welcome state with SERVER-SIDE persistence
 *
 * Problem: localStorage can be reset by Lovable preview URLs, causing
 * welcome to show on every login instead of just first signup.
 *
 * Solution: Use profiles.has_seen_welcome column (server-side boolean)
 * - On load, check DB for has_seen_welcome flag
 * - If false: show welcome, then immediately update to true
 * - If true: never show again
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
      try {
        // Check server-side flag directly - no localStorage dependency
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('has_seen_welcome, created_at')
          .eq('id', userId)
          .single();

        if (error) {
          // On error, don't show welcome (fail safe)
          setIsChecking(false);
          setShouldShowWelcome(false);
          return;
        }

        // If has_seen_welcome is true, never show again
        if (profile?.has_seen_welcome === true) {
          setIsChecking(false);
          setShouldShowWelcome(false);
          return;
        }

        // Check if user is "old" (created more than 10 minutes ago)
        // If so, they've definitely seen the welcome before (flag might not have been set)
        if (profile?.created_at) {
          const createdAt = new Date(profile.created_at);
          const now = new Date();
          const ageMs = now.getTime() - createdAt.getTime();
          const tenMinutesMs = 10 * 60 * 1000;

          if (ageMs > tenMinutesMs) {
            // User is not new - mark as seen and don't show
            markWelcomeAsSeen(userId);
            setIsChecking(false);
            setShouldShowWelcome(false);
            return;
          }
        }

        // User is new and hasn't seen welcome - show it!
        // Mark as seen IMMEDIATELY (optimistic) to prevent double-showing
        markWelcomeAsSeen(userId);
        setIsChecking(false);
        setShouldShowWelcome(true);

      } catch (error) {
        // On any error, don't show welcome (fail safe)
        setIsChecking(false);
        setShouldShowWelcome(false);
      }
    };

    checkWelcomeStatus();
  }, [userId]);

  // Mark welcome as seen in the database (server-side)
  const markWelcomeAsSeen = async (uid: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ has_seen_welcome: true })
        .eq('id', uid);
    } catch (error) {
      // Silent fail - best effort
    }
  };

  const dismissWelcome = useCallback(() => {
    if (userId) {
      // Already marked as seen when we decided to show it
      // This is just for UI state
    }
    setShouldShowWelcome(false);
  }, [userId]);

  return {
    shouldShowWelcome,
    isChecking,
    dismissWelcome,
  };
}
