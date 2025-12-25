import { useNavigate } from 'react-router-dom';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

/**
 * iOS-style Swipe Back Gesture Hook
 * Enables swipe-from-left-edge gesture to navigate back
 * Works on touch devices with haptic feedback support
 */
export function useSwipeBack(options: {
  edgeWidth?: number;
  threshold?: number;
  enabled?: boolean;
} = {}) {
  const {
    edgeWidth = 50,
    threshold = 100,
    enabled = true,
  } = options;

  const navigate = useNavigate();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 200], [1, 0.5]);
  const scale = useTransform(x, [0, 200], [1, 0.95]);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];

      // Only trigger from left edge
      if (touch.clientX > edgeWidth) return;

      // Prevent if can't go back
      if (window.history.length <= 1) return;

      startXRef.current = touch.clientX;
      isDraggingRef.current = true;

      // Haptic feedback on supported devices
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;

      const touch = e.touches[0];
      const currentX = touch.clientX - startXRef.current;

      // Only allow rightward swipes
      if (currentX > 0) {
        x.set(currentX);

        // Prevent default scroll when swiping
        if (currentX > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isDraggingRef.current) return;

      const currentX = x.get();

      // If dragged beyond threshold, navigate back
      if (currentX > threshold) {
        // Haptic feedback on navigation
        if ('vibrate' in navigator) {
          navigator.vibrate(20);
        }

        // Animate to full screen width then navigate
        animate(x, window.innerWidth, {
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }).then(() => {
          navigate(-1);
          x.set(0);
        });
      } else {
        // Snap back to original position
        animate(x, 0, {
          type: 'spring',
          stiffness: 400,
          damping: 30,
        });
      }

      isDraggingRef.current = false;
    };

    const handleTouchCancel = () => {
      if (!isDraggingRef.current) return;

      // Snap back on cancel
      animate(x, 0, {
        type: 'spring',
        stiffness: 400,
        damping: 30,
      });

      isDraggingRef.current = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [navigate, x, edgeWidth, threshold, enabled]);

  return {
    x,
    opacity,
    scale,
    isDragging: isDraggingRef.current,
  };
}

/**
 * Hook version for component-level swipe detection
 * Returns style props to apply to your container
 */
export function useSwipeBackStyles(enabled = true) {
  const { x, opacity, scale } = useSwipeBack({ enabled });

  return {
    style: {
      x,
      opacity,
      scale,
    },
  };
}
