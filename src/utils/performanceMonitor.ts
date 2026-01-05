// Performance monitoring and optimization utilities
import { logger } from './prodLogger';
// Track component render times
export function trackRenderTime(componentName: string, startTime: number) {
  if (import.meta.env.DEV) {
    const renderTime = performance.now() - startTime;
    if (renderTime > 16) { // Warn if render takes more than 1 frame (16ms)
    }
  }
}

// Preload critical resources
export function preloadCriticalAssets() {
  // Preload fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
}

// Optimize image loading
export function optimizeImages() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // Add loading="lazy" to images below the fold
    if (img.getBoundingClientRect().top > window.innerHeight) {
      img.loading = 'lazy';
    }
    
    // Add decoding="async" for better performance
    img.decoding = 'async';
  });
}

// Monitor Core Web Vitals
export function monitorWebVitals(): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return () => {};

  const observers: PerformanceObserver[] = [];

  try {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
      const lcp = lastEntry.renderTime || lastEntry.loadTime;
      // LCP tracked: ${lcp}ms - stored for debugging
      void lcp;
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    observers.push(lcpObserver);

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: PerformanceEntry & { processingStart?: number }) => {
        const fid = (entry.processingStart || 0) - entry.startTime;
        // FID tracked: ${fid}ms - stored for debugging
        void fid;
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    observers.push(fidObserver);

    // Cumulative Layout Shift (CLS)
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value?: number }) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value || 0;
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    observers.push(clsObserver);
    // Track CLS score
    void clsScore;

    // Return cleanup function
    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  } catch (error) {
    logger.error('Failed to initialize Web Vitals monitoring:', error);
    return () => {};
  }
}

// Initialize performance optimizations
export function initPerformanceOptimizations(): () => void {
  if (typeof window === 'undefined') return () => {};

  const cleanupFunctions: (() => void)[] = [];

  // Run optimizations after page load
  if (document.readyState === 'complete') {
    optimizeImages();
  } else {
    window.addEventListener('load', optimizeImages);
    cleanupFunctions.push(() => {
      window.removeEventListener('load', optimizeImages);
    });
  }

  // Monitor web vitals in development
  if (import.meta.env.DEV) {
    const cleanup = monitorWebVitals();
    cleanupFunctions.push(cleanup);
  }

  // Return combined cleanup function
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
}

// Request Idle Callback wrapper for non-critical tasks
export function runWhenIdle(callback: () => void, timeout = 2000) {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, timeout);
  }
}
