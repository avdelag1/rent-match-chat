import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LastSwipe {
  targetId: string;
  targetType: 'listing' | 'profile';
  swipeType: 'like' | 'pass' | 'super_like';
  timestamp: Date;
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

  // Persist to localStorage whenever lastSwipe changes
  useEffect(() => {
    if (lastSwipe) {
      localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(lastSwipe));
    } else {
      localStorage.removeItem(UNDO_STORAGE_KEY);
    }
  }, [lastSwipe]);

  const recordSwipe = useCallback((targetId: string, targetType: 'listing' | 'profile', swipeType: 'like' | 'pass' | 'super_like') => {
    setLastSwipe({
      targetId,
      targetType,
      swipeType,
      timestamp: new Date(),
    });
  }, []);

  const undoMutation = useMutation({
    mutationFn: async () => {
      if (!lastSwipe) throw new Error('No swipe to undo');

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Error fetching authenticated user:', authError);
        throw authError;
      }
      if (!user) throw new Error('User not authenticated');

      // Remove the last swipe from the database
      const { error } = await supabase
        .from('swipes')
        .delete()
        .match({
          user_id: user.id,
          target_id: lastSwipe.targetId,
          target_type: lastSwipe.targetType,
        });

      if (error) throw error;

      return lastSwipe;
    },
    onSuccess: (undoneSwipe) => {
      // Clear the last swipe
      setLastSwipe(null);
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['swiped-listings'] });
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['swipe-analytics'] });
      
      toast({
        title: "Swipe undone",
        description: `Your ${undoneSwipe.swipeType} has been reversed.`,
      });
    },
    onError: (error) => {
      console.error('Failed to undo swipe:', error);
      toast({
        title: "Failed to undo",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const canUndo = lastSwipe && (new Date().getTime() - lastSwipe.timestamp.getTime()) < 30000; // 30 seconds

  return {
    recordSwipe,
    undoLastSwipe: undoMutation.mutate,
    canUndo,
    isUndoing: undoMutation.isPending,
    lastSwipe,
  };
}