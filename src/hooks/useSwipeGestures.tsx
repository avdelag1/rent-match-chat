import { useCallback } from 'react';
import { PanInfo } from 'framer-motion';

interface UseSwipeGesturesOptions {
  onSwipe: (direction: 'left' | 'right') => void;
  swipeThresholdX?: number;
  velocityThreshold?: number;
}

export function useSwipeGestures({
  onSwipe,
  swipeThresholdX = 120,
  velocityThreshold = 500
}: UseSwipeGesturesOptions) {
  
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Check horizontal swipes only
    const absOffsetX = Math.abs(offset.x);
    const absVelocityX = Math.abs(velocity.x);
    
    if (absOffsetX > swipeThresholdX || absVelocityX > velocityThreshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
      return;
    }
    
    // If no threshold met, card will snap back (handled by spring physics)
  }, [onSwipe, swipeThresholdX, velocityThreshold]);
  
  return { handleDragEnd };
}
