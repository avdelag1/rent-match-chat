import { useState, useEffect, useRef } from 'react';

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
 * CRITICAL: This hook must be STABLE across navigation to prevent reset.
 * Uses refs for scroll tracking to avoid dependency issues.
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
  
  // Use refs to avoid effect dependencies that cause remounts
  // lastObservedY tracks the most recent scroll position we saw (updated every frame)
  const lastObservedY = useRef(0);
  // lastTriggerY is the baseline for threshold calculations (only updated when we actually trigger a hide/show)
  const lastTriggerY = useRef(0);
  const ticking = useRef(false);
  const thresholdRef = useRef(threshold);
  const showAtTopRef = useRef(showAtTop);
  const targetSelectorRef = useRef(targetSelector);
  
  // Update refs when props change
  thresholdRef.current = threshold;
  showAtTopRef.current = showAtTop;
  targetSelectorRef.current = targetSelector;

  useEffect(() => {
    // Find the scroll target
    const findTarget = (): Element | Window | null => {
      const selector = targetSelectorRef.current;
      if (!selector) return window;
      
      let target = document.querySelector(selector);
      
      // Fallback chain for common scroll containers
      if (!target) {
        target = document.querySelector('main[class*="overflow"]') || 
                 document.querySelector('[id*="scroll-container"]') ||
                 document.querySelector('main');
      }
      
      return target;
    };
    
    let target = findTarget();
    let retryCount = 0;
    const maxRetries = 5;
    
    // Retry mechanism for dynamic DOM
    const retryFindTarget = () => {
      if (!target && retryCount < maxRetries) {
        retryCount++;
        target = findTarget();
        if (target) {
          attachListener();
        } else {
          setTimeout(retryFindTarget, 100);
        }
      }
    };
    
    const handleScroll = () => {
      if (ticking.current) return;
      
      ticking.current = true;
      requestAnimationFrame(() => {
        const scrollTarget = findTarget();
        
        const currentScrollY = scrollTarget instanceof Element
          ? scrollTarget.scrollTop 
          : window.pageYOffset || document.documentElement.scrollTop;

        // Always keep an up-to-date observed position to avoid baselines getting stale over time.
        // (This is the root cause of “it works for a while then stops”.)
        const prevObserved = lastObservedY.current;
        lastObservedY.current = currentScrollY;

        // Use threshold baseline for direction changes (stable, non-jittery behavior)
        const diffFromTrigger = currentScrollY - lastTriggerY.current;
        
        // Update scroll position state
        setScrollY(currentScrollY);
        setIsAtTop(currentScrollY <= 5);

        // At top - always visible + reset baselines so the next scroll-down hides correctly.
        if (showAtTopRef.current && currentScrollY <= 5) {
          setIsVisible(true);
          setScrollDirection('none');

          // Reset both baselines at the top to prevent inverted diff after long scroll sessions.
          lastTriggerY.current = currentScrollY;
          // Keep observed in sync (especially when top snaps due to momentum)
          lastObservedY.current = currentScrollY;

          ticking.current = false;
          return;
        }

        // Check if we've scrolled past threshold since last trigger
        if (Math.abs(diffFromTrigger) >= thresholdRef.current) {
          if (diffFromTrigger > 0) {
            // Scrolling DOWN - hide
            setScrollDirection('down');
            setIsVisible(false);
          } else {
            // Scrolling UP - show
            setScrollDirection('up');
            setIsVisible(true);
          }

          // Update baseline only when a hide/show trigger happens
          lastTriggerY.current = currentScrollY;
        }

        // If scroll container snaps (momentum/overscroll), keep baseline sane
        // so we don't accumulate huge stale diffs.
        if (Math.abs(currentScrollY - prevObserved) > 5000) {
          lastTriggerY.current = currentScrollY;
        }
        
        ticking.current = false;
      });
    };
    
    const attachListener = () => {
      if (!target) return;
      
      // Initialize scroll position
      const initialScrollY = target instanceof Element
        ? target.scrollTop 
        : window.pageYOffset || document.documentElement.scrollTop;

      lastObservedY.current = initialScrollY;
      lastTriggerY.current = initialScrollY;
      setScrollY(initialScrollY);
      setIsAtTop(initialScrollY <= 5);
      
      // Always start visible at top
      if (initialScrollY <= 5) {
        setIsVisible(true);
      }
      
      target.addEventListener('scroll', handleScroll, { passive: true });
    };
    
    if (target) {
      attachListener();
    } else {
      retryFindTarget();
    }
    
    return () => {
      if (target) {
        target.removeEventListener('scroll', handleScroll);
      }
    };
  }, []); // Empty dependency array - effect runs once and uses refs for current values

  return {
    scrollDirection,
    isVisible,
    scrollY,
    isAtTop,
  };
}
