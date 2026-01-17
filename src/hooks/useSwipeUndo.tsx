import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
    // Only allow undoing "pass" swipes (dislikes) - users get one last chance to reconsider
    if (swipeType === 'pass') {
      setLastSwipe({
        targetId,
        targetType,
        swipeType,
        timestamp: new Date(),
        category,
      });
    } else {
      // Clear any previous undo state if they liked something
      setLastSwipe(null);
    }
  }, []);

  const undoMutation = useMutation({
    mutationFn: async () => {
      if (!lastSwipe) throw new Error('No swipe to undo');

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        logger.error('Error fetching authenticated user:', authError);
        throw authError;
      }
      if (!user) throw new Error('User not authenticated');

      // Remove the last swipe from the likes table
      const { error } = await supabase
        .from('likes')
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

      if (error) throw error;

      return lastSwipe;
    },
    onSuccess: (undoneSwipe) => {
      // Bring the card back in the deck by calling the appropriate undo method
      let deckUndoSuccess = false;
      if (undoneSwipe.targetType === 'listing') {
        deckUndoSuccess = undoClientSwipe();
      } else if (undoneSwipe.targetType === 'profile' && undoneSwipe.category) {
        deckUndoSuccess = undoOwnerSwipe(undoneSwipe.category);
      }

      if (!deckUndoSuccess) {
        logger.warn('[useSwipeUndo] Deck undo failed - card may not return to deck immediately');
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

      toast({
        title: "Card Returned",
        description: `The ${undoneSwipe.targetType === 'listing' ? 'listing' : 'profile'} you passed on has been brought back.`,
      });
    },
    onError: (error) => {
      logger.error('Failed to undo swipe:', error);
      toast({
        title: "Failed to undo",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Can only undo "pass" swipes within 30 seconds - gives users one last chance to reconsider
  const canUndo = lastSwipe &&
                  lastSwipe.swipeType === 'pass' &&
                  (new Date().getTime() - lastSwipe.timestamp.getTime()) < 30000;

  return {
    recordSwipe,
    undoLastSwipe: undoMutation.mutate,
    canUndo,
    isUndoing: undoMutation.isPending,
    lastSwipe,
  };
}