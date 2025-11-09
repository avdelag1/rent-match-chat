import { useCallback } from 'react';
import { PanInfo } from 'framer-motion';

interface UseSwipeGesturesOptions {
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  swipeThresholdX?: number;
  swipeThresholdY?: number;
  velocityThreshold?: number;
}

export function useSwipeGestures({
  onSwipe,
  swipeThresholdX = 150,
  swipeThresholdY = 120,
  velocityThreshold = 500
}: UseSwipeGesturesOptions) {
  
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Priority: Check super like first (swipe up)
    if (offset.y < -swipeThresholdY || velocity.y < -velocityThreshold) {
      onSwipe('up');
      return;
    }
    
    // Check horizontal swipes
    const absOffsetX = Math.abs(offset.x);
    const absVelocityX = Math.abs(velocity.x);
    
    if (absOffsetX > swipeThresholdX || absVelocityX > velocityThreshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      onSwipe(direction);
      return;
    }
    
    // If no threshold met, card will snap back (handled by spring physics)
  }, [onSwipe, swipeThresholdX, swipeThresholdY, velocityThreshold]);
  
  return { handleDragEnd };
}
