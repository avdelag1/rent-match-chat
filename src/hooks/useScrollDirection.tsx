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
  const lastScrollY = useRef(0);
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
        
        const diff = currentScrollY - lastScrollY.current;
        
        // Update scroll position state
        setScrollY(currentScrollY);
        setIsAtTop(currentScrollY <= 5);
        
        // Check if we've scrolled past threshold
        if (Math.abs(diff) >= thresholdRef.current) {
          if (diff > 0) {
            // Scrolling DOWN - hide
            setScrollDirection('down');
            setIsVisible(false);
          } else {
            // Scrolling UP - show
            setScrollDirection('up');
            setIsVisible(true);
          }
          
          lastScrollY.current = currentScrollY;
        }
        
        // At top - always visible
        if (showAtTopRef.current && currentScrollY <= 5) {
          setIsVisible(true);
          setScrollDirection('none');
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
      
      lastScrollY.current = initialScrollY;
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
