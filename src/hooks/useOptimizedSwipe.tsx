import { useCallback, useMemo } from 'react';
import { useSwipe } from './useSwipe';

export const useOptimizedSwipe = () => {
  const swipeMutation = useSwipe();

  const handleSwipe = useCallback(
    (targetId: string, direction: 'left' | 'right', targetType: 'listing' | 'profile') => {
      // Optimistic UI update - immediate feedback
      const optimisticUpdate = () => {
        // Add visual feedback immediately
        const element = document.querySelector(`[data-target-id="${targetId}"]`);
        if (element) {
          element.classList.add(direction === 'right' ? 'animate-bounce-gentle' : 'animate-fade-out');
        }
      };

      optimisticUpdate();
      
      return swipeMutation.mutateAsync({
        targetId,
        direction,
        targetType
      });
    },
    [swipeMutation]
  );

  const isLoading = swipeMutation.isPending;
  const error = swipeMutation.error;

  return useMemo(
    () => ({
      handleSwipe,
      isLoading,
      error
    }),
    [handleSwipe, isLoading, error]
  );
};