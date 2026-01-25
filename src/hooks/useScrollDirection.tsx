import { useState, useEffect, useCallback, useRef } from 'react';

export type ScrollDirection = 'up' | 'down' | 'none';

interface UseScrollDirectionOptions {
  /** Threshold in pixels before triggering direction change */
  threshold?: number;
  /** Whether to show the element at the very top of scroll */
  showAtTop?: boolean;
  /** Target element selector (defaults to window) */
  targetSelector?: string;
}

interface UseScrollDirectionReturn {
  /** Current scroll direction */
  scrollDirection: ScrollDirection;
  /** Whether the bottom bar should be visible */
  isVisible: boolean;
  /** Current scroll position */
  scrollY: number;
  /** Whether user is at the top of the page */
  isAtTop: boolean;
}

/**
 * Hook to detect scroll direction for hide/show navigation behavior
 * 
 * Behavior:
 * - At top of page: Always visible
 * - Scrolling down: Hides the element
 * - Scrolling up: Shows the element
 */
export function useScrollDirection({
  threshold = 10,
  showAtTop = true,
  targetSelector,
}: UseScrollDirectionOptions = {}): UseScrollDirectionReturn {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('none');
  const [isVisible, setIsVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateScrollDirection = useCallback(() => {
    const target = targetSelector 
      ? document.querySelector(targetSelector) 
      : null;
    
    const currentScrollY = target 
      ? target.scrollTop 
      : window.pageYOffset || document.documentElement.scrollTop;
    
    const diff = currentScrollY - lastScrollY.current;
    
    // Update state
    setScrollY(currentScrollY);
    setIsAtTop(currentScrollY <= 5);
    
    // Check if we've scrolled past threshold
    if (Math.abs(diff) < threshold) {
      ticking.current = false;
      return;
    }
    
    if (diff > 0) {
      // Scrolling DOWN - hide
      setScrollDirection('down');
      setIsVisible(false);
    } else if (diff < 0) {
      // Scrolling UP - show
      setScrollDirection('up');
      setIsVisible(true);
    }
    
    // At top - always visible
    if (showAtTop && currentScrollY <= 5) {
      setIsVisible(true);
      setScrollDirection('none');
    }
    
    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [threshold, showAtTop, targetSelector]);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      // Use rAF for performance
      requestAnimationFrame(updateScrollDirection);
      ticking.current = true;
    }
  }, [updateScrollDirection]);

  useEffect(() => {
    const target = targetSelector 
      ? document.querySelector(targetSelector) 
      : window;
    
    if (!target) return;
    
    // Initialize
    const initialScrollY = targetSelector && target instanceof Element
      ? target.scrollTop 
      : window.pageYOffset || document.documentElement.scrollTop;
    
    lastScrollY.current = initialScrollY;
    setScrollY(initialScrollY);
    setIsAtTop(initialScrollY <= 5);
    setIsVisible(true);
    
    target.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, targetSelector]);

  return {
    scrollDirection,
    isVisible,
    scrollY,
    isAtTop,
  };
}
