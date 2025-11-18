/**
 * Performance Optimization Utilities
 * Enhanced utilities for maximum app performance
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Lazy load a component with retry logic for failed chunk loads
 * This prevents "Loading chunk failed" errors in production
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3,
  interval = 1000
): LazyExoticComponent<T> {
  return lazy(async () => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await componentImport();
      } catch (error) {
        console.warn(`Failed to load component (attempt ${attempt + 1}/${retries}):`, error);

        // If this is the last attempt, throw the error
        if (attempt === retries - 1) {
          throw error;
        }

        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, interval * Math.pow(2, attempt)));
      }
    }

    throw new Error('Failed to load component after retries');
  });
}

/**
 * Preload an image to avoid flickering
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Check if user prefers reduced motion (accessibility)
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detect if user is on a slow connection
 */
export function isSlowConnection(): boolean {
  // @ts-ignore - navigator.connection is experimental
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
  }
  return false;
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId!);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

// Image lazy loading with intersection observer
export function setupLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Memory cleanup utility
export function cleanupMemory() {
  // Clear any lingering timers - simplified approach
  if (typeof window !== 'undefined') {
    // Clear common timeout ranges (this is a simplified cleanup)
    for (let i = 1; i < 10000; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
  }
  
  // Force garbage collection if available (dev mode)
  if (process.env.NODE_ENV === 'development' && 'gc' in window) {
    (window as any).gc();
  }
}

// Bundle analyzer helper
export function logBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle loaded at:', new Date().toISOString());
    
    // Log performance metrics
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('Performance metrics:', {
        'DOM Content Loaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        'Load Complete': perfData.loadEventEnd - perfData.loadEventStart,
        'Total Load Time': perfData.loadEventEnd - perfData.fetchStart
      });
    });
  }
}