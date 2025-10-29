/**
 * Keyboard Navigation Hook
 * Provides accessible keyboard controls for card feed
 * Respects prefers-reduced-motion for accessibility
 */

import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationOptions {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onSpace?: () => void;
  enabled?: boolean;
}

/**
 * Hook for keyboard navigation in card feed
 */
export function useKeyboardNavigation({
  onLeft,
  onRight,
  onUp,
  onDown,
  onEnter,
  onEscape,
  onSpace,
  enabled = true
}: UseKeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onLeft?.();
          break;

        case 'ArrowRight':
          event.preventDefault();
          onRight?.();
          break;

        case 'ArrowUp':
          event.preventDefault();
          onUp?.();
          break;

        case 'ArrowDown':
          event.preventDefault();
          onDown?.();
          break;

        case 'Enter':
          event.preventDefault();
          onEnter?.();
          break;

        case 'Escape':
          event.preventDefault();
          onEscape?.();
          break;

        case ' ':
          event.preventDefault();
          onSpace?.();
          break;

        default:
          break;
      }
    },
    [enabled, onLeft, onRight, onUp, onDown, onEnter, onEscape, onSpace]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

/**
 * Check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

// Import useState
import { useState } from 'react';
