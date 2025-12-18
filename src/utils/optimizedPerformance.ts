// Optimized performance utilities for smooth app experience

// Fast debounce for high-performance apps
export function fastDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
}

// Efficient RAF throttle for smooth animations
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  return (...args: Parameters<T>) => {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func(...args);
        rafId = null;
      });
    }
  };
}

// Optimized intersection observer for lazy loading
export function createOptimizedIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
}

// Efficient virtual scrolling helper
export function calculateVisibleItems(
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number,
  overscan: number = 3
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { startIndex, endIndex, visibleItems: endIndex - startIndex + 1 };
}

// Memory-efficient event cleanup
export function createCleanupHandler() {
  const cleanupFunctions: (() => void)[] = [];
  
  return {
    add: (cleanup: () => void) => cleanupFunctions.push(cleanup),
    cleanup: () => {
      cleanupFunctions.forEach(fn => fn());
      cleanupFunctions.length = 0;
    }
  };
}

// Fast CSS-based animations
export const FAST_TRANSITIONS = {
  quick: 'transition-transform duration-100',
  smooth: 'transition-all duration-150 ease-out',
  bounce: 'transition-transform duration-200 ease-out',
  scale: 'active:scale-98 transform',
} as const;

// Optimized touch interactions
export function createTouchHandler(
  onStart?: (e: TouchEvent) => void,
  onMove?: (e: TouchEvent) => void,
  onEnd?: (e: TouchEvent) => void
) {
  return {
    onTouchStart: onStart ? (e: TouchEvent) => {
      e.preventDefault();
      onStart(e);
    } : undefined,
    onTouchMove: onMove ? rafThrottle(onMove) : undefined,
    onTouchEnd: onEnd
  };
}

// Performance monitoring
export function measurePerformance(name: string) {
  const start = performance.now();

  return {
    end: () => {
      const duration = performance.now() - start;
      // Performance measurement complete - duration available for debugging
      return duration;
    }
  };
}