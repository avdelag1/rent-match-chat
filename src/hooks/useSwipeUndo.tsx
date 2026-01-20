import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/prodLogger';
import { useSwipeDeckStore } from '@/state/swipeDeckStore';

interface LastSwipe {
  targetId: string;
  targetType: 'listing' | 'profile';
  swipeType: 'like' | 'pass' | 'super_like';
  timestamp: Date;
  category?: string; // For owner swipes (profile type) - e.g., 'property', 'moto', etc.
}

const UNDO_STORAGE_KEY = 'lastSwipe';

export function useSwipeUndo() {
  const [lastSwipe, setLastSwipe] = useState<LastSwipe | null>(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(UNDO_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return { ...parsed, timestamp: new Date(parsed.timestamp) };
      } catch {
        return null;
      }
    }
    return null;
  });
  const queryClient = useQueryClient();

  // Get deck store undo methods
  const undoClientSwipe = useSwipeDeckStore((state) => state.undoClientSwipe);
  const undoOwnerSwipe = useSwipeDeckStore((state) => state.undoOwnerSwipe);

  // Check if user has unlimited undo from premium subscription
  // Disabled: rpc function doesn't exist - always returns false
  const hasUnlimitedUndo = false;

  // Get today's undo count
  // Disabled: rpc function doesn't exist - use local tracking instead
  const undoTracking = { undo_count: 0 };

  // Persist to localStorage whenever lastSwipe changes
  useEffect(() => {
    if (lastSwipe) {
      localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(lastSwipe));
    } else {
      localStorage.removeItem(UNDO_STORAGE_KEY);
    }
  }, [lastSwipe]);

  const recordSwipe = useCallback((
    targetId: string,
    targetType: 'listing' | 'profile',
    swipeType: 'like' | 'pass' | 'super_like',
    category?: string
  ) => {
    logger.info('[useSwipeUndo] recordSwipe called', {
      targetId,
      targetType,
      swipeType,
      category,
    });

    // Only allow undoing "pass" swipes (dislikes) - users get one last chance to reconsider
    if (swipeType === 'pass') {
      const newLastSwipe = {
        targetId,
        targetType,
        swipeType,
        timestamp: new Date(),
        category,
      };
      setLastSwipe(newLastSwipe);
      logger.info('[useSwipeUndo] Set lastSwipe for potential undo:', newLastSwipe.targetId);
    } else {
      // Clear any previous undo state if they liked something
      setLastSwipe(null);
      logger.info('[useSwipeUndo] Cleared lastSwipe (swipe type was not pass)');
    }
  }, []);

  const undoMutation = useMutation({
    mutationFn: async () => {
      logger.info('[useSwipeUndo] Starting undo operation', { lastSwipe: lastSwipe?.targetId });

      if (!lastSwipe) {
        logger.warn('[useSwipeUndo] No swipe to undo - lastSwipe is null');
        throw new Error('No swipe to undo');
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        logger.error('[useSwipeUndo] Error fetching authenticated user:', authError);
        throw authError;
      }
      if (!user) {
        logger.error('[useSwipeUndo] User not authenticated');
        throw new Error('User not authenticated');
      }

      // Check if user has reached daily limit (unless they have unlimited)
      if (!hasUnlimitedUndo) {
        const currentCount = undoTracking?.undo_count || 0;
        logger.info('[useSwipeUndo] Daily undo count:', currentCount);
        if (currentCount >= 1) {
          logger.warn('[useSwipeUndo] Daily limit reached');
          throw new Error('DAILY_LIMIT_REACHED');
        }
      }

      // Remove the last swipe from the appropriate table
      logger.info('[useSwipeUndo] Deleting swipe:', lastSwipe.targetId);

      // Only delete from dislikes table (pass swipes go to dislikes, not likes)
      // The new architecture separates likes (right swipes) from dislikes (left swipes/passes)
      const { error } = await supabase
        .from('dislikes')
        .delete()
        .match({
          user_id: user.id,
          target_id: lastSwipe.targetId,
        });

      // Also remove from profile_views for consistent state
      await supabase
        .from('profile_views')
        .delete()
        .match({
          user_id: user.id,
          viewed_profile_id: lastSwipe.targetId,
          view_type: lastSwipe.targetType,
        });

      if (error) {
        logger.error('[useSwipeUndo] Error deleting from likes:', error);
        throw error;
      }

      // Increment undo count (only if not unlimited)
      // Disabled: rpc function doesn't exist
      if (!hasUnlimitedUndo) {
        logger.info('[useSwipeUndo] Incrementing undo count (disabled - no rpc function)');
      }

      logger.info('[useSwipeUndo] Undo operation successful');
      return lastSwipe;
    },
    onSuccess: (undoneSwipe) => {
      logger.info('[useSwipeUndo] onSuccess - processing deck undo', {
        targetType: undoneSwipe.targetType,
        targetId: undoneSwipe.targetId,
        category: undoneSwipe.category,
      });

      // Bring the card back in the deck by calling the appropriate undo method
      let deckUndoSuccess = false;
      if (undoneSwipe.targetType === 'listing') {
        logger.info('[useSwipeUndo] Calling undoClientSwipe');
        deckUndoSuccess = undoClientSwipe();
      } else if (undoneSwipe.targetType === 'profile') {
        // FIX: Allow undo even without category by using 'default' as fallback
        const categoryToUse = undoneSwipe.category || 'default';
        logger.info('[useSwipeUndo] Calling undoOwnerSwipe with category:', categoryToUse);
        deckUndoSuccess = undoOwnerSwipe(categoryToUse);
      }

      if (!deckUndoSuccess) {
        logger.warn('[useSwipeUndo] Deck undo returned false - card may not return to deck immediately');
      } else {
        logger.info('[useSwipeUndo] Deck undo successful');
      }

      // Clear the last swipe
      setLastSwipe(null);

      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['smart-listings'] });
      queryClient.invalidateQueries({ queryKey: ['smart-clients'] });
      queryClient.invalidateQueries({ queryKey: ['swiped-listings'] });
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['swipe-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['undo-tracking'] }); // Refresh undo count

      const remainingUndos = hasUnlimitedUndo
        ? 'unlimited'
        : `${Math.max(0, 1 - ((undoTracking?.undo_count || 0) + 1))} remaining today`;

      toast({
        title: "Card Returned",
        description: hasUnlimitedUndo
          ? `The ${undoneSwipe.targetType === 'listing' ? 'listing' : 'profile'} you passed on has been brought back. (Unlimited undo active)`
          : `The ${undoneSwipe.targetType === 'listing' ? 'listing' : 'profile'} you passed on has been brought back. You have ${remainingUndos}.`,
      });
    },
    onError: (error) => {
      logger.error('Failed to undo swipe:', error);

      // Check if daily limit reached
      if (error instanceof Error && error.message === 'DAILY_LIMIT_REACHED') {
        toast({
          title: "Daily Limit Reached",
          description: "You've used your 1 free undo today. Upgrade to premium for unlimited undos!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to undo",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Can only undo "pass" swipes within 30 seconds - gives users one last chance to reconsider
  // Also check daily limit (1 per day for free users, unlimited for premium)
  const withinTimeWindow = lastSwipe &&
                           lastSwipe.swipeType === 'pass' &&
                           (new Date().getTime() - lastSwipe.timestamp.getTime()) < 30000;

  const withinDailyLimit = hasUnlimitedUndo || (undoTracking?.undo_count || 0) < 1;

  const canUndo = withinTimeWindow && withinDailyLimit;

  return {
    recordSwipe,
    undoLastSwipe: undoMutation.mutate,
    canUndo,
    isUndoing: undoMutation.isPending,
    lastSwipe,
    hasUnlimitedUndo,
    remainingUndos: hasUnlimitedUndo ? 999 : Math.max(0, 1 - (undoTracking?.undo_count || 0)),
    // FIX: Expose undo success state for containers to sync local state
    undoSuccess: undoMutation.isSuccess,
    resetUndoState: undoMutation.reset,
  };
}