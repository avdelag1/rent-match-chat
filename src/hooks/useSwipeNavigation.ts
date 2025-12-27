import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMotionValue, PanInfo } from 'framer-motion';
import { triggerHaptic } from '@/utils/haptics';

export interface PageRoute {
  path: string;
  label?: string;
}

export interface SwipeNavigationOptions {
  routes: PageRoute[];
  swipeThreshold?: number; // Distance in pixels to trigger navigation
  enabled?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  onNavigate?: (direction: 'left' | 'right', to: string) => void;
}

/**
 * Custom hook for horizontal swipe navigation between pages
 *
 * @example
 * const swipeHandlers = useSwipeNavigation({
 *   routes: [
 *     { path: '/client/settings', label: 'Settings' },
 *     { path: '/client/security', label: 'Security' },
 *     { path: '/client/notifications', label: 'Notifications' }
 *   ]
 * });
 */
export const useSwipeNavigation = ({
  routes,
  swipeThreshold = 100,
  enabled = true,
  onSwipeStart,
  onSwipeEnd,
  onNavigate,
}: SwipeNavigationOptions) => {
  const navigate = useNavigate();
  const location = useLocation();
  const x = useMotionValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canSwipeLeft, setCanSwipeLeft] = useState(false);
  const [canSwipeRight, setCanSwipeRight] = useState(false);

  // Update current index based on location
  useEffect(() => {
    const index = routes.findIndex(route =>
      location.pathname === route.path ||
      location.pathname.startsWith(route.path + '/')
    );
    if (index !== -1) {
      setCurrentIndex(index);
      setCanSwipeLeft(index > 0);
      setCanSwipeRight(index < routes.length - 1);
    }
  }, [location.pathname, routes]);

  const handleDragStart = useCallback(() => {
    if (!enabled) return;
    onSwipeStart?.();
  }, [enabled, onSwipeStart]);

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!enabled) return;

      const swipeDistance = info.offset.x;
      const swipeVelocity = info.velocity.x;

      // Determine if swipe was strong enough
      const isStrongSwipe = Math.abs(swipeDistance) > swipeThreshold ||
                            Math.abs(swipeVelocity) > 500;

      if (isStrongSwipe) {
        // Swipe right = go to previous page (index - 1)
        if (swipeDistance > 0 && currentIndex > 0) {
          const targetRoute = routes[currentIndex - 1];
          triggerHaptic('medium');
          onNavigate?.('right', targetRoute.path);
          navigate(targetRoute.path);
        }
        // Swipe left = go to next page (index + 1)
        else if (swipeDistance < 0 && currentIndex < routes.length - 1) {
          const targetRoute = routes[currentIndex + 1];
          triggerHaptic('medium');
          onNavigate?.('left', targetRoute.path);
          navigate(targetRoute.path);
        }
      }

      // Reset position
      x.set(0);
      onSwipeEnd?.();
    },
    [enabled, currentIndex, routes, swipeThreshold, navigate, x, onSwipeEnd, onNavigate]
  );

  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!enabled) return;

      const offset = info.offset.x;

      // Constrain drag based on available pages
      if (offset > 0 && !canSwipeLeft) {
        // Resistance when trying to swipe right on first page
        x.set(offset * 0.2);
      } else if (offset < 0 && !canSwipeRight) {
        // Resistance when trying to swipe left on last page
        x.set(offset * 0.2);
      } else {
        // Normal drag
        x.set(offset * 0.5); // Dampened movement
      }

      // Haptic feedback at threshold
      if (Math.abs(offset) === swipeThreshold) {
        triggerHaptic('light');
      }
    },
    [enabled, canSwipeLeft, canSwipeRight, x, swipeThreshold]
  );

  return {
    // Motion props to spread onto draggable element
    dragProps: {
      drag: enabled ? 'x' as const : false,
      dragConstraints: { left: 0, right: 0 },
      dragElastic: 0.2,
      onDragStart: handleDragStart,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd,
      style: { x },
    },
    // Current state
    currentIndex,
    currentRoute: routes[currentIndex],
    canSwipeLeft,
    canSwipeRight,
    // Motion value for custom animations
    x,
    // Navigation info
    totalPages: routes.length,
    previousRoute: currentIndex > 0 ? routes[currentIndex - 1] : null,
    nextRoute: currentIndex < routes.length - 1 ? routes[currentIndex + 1] : null,
  };
};
