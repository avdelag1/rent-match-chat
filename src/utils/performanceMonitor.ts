// Performance monitoring and optimization utilities

// Track component render times
export function trackRenderTime(componentName: string, startTime: number) {
  if (process.env.NODE_ENV === 'development') {
    const renderTime = performance.now() - startTime;
    if (renderTime > 16) { // Warn if render takes more than 1 frame (16ms)
      console.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
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
export function monitorWebVitals() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      const lcp = lastEntry.renderTime || lastEntry.loadTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 LCP:', lcp.toFixed(2) + 'ms', lcp < 2500 ? '✅' : '⚠️');
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime;
        if (process.env.NODE_ENV === 'development') {
          console.log('⚡ FID:', fid.toFixed(2) + 'ms', fid < 100 ? '✅' : '⚠️');
        }
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
          if (process.env.NODE_ENV === 'development') {
            console.log('📏 CLS:', clsScore.toFixed(3), clsScore < 0.1 ? '✅' : '⚠️');
          }
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (error) {
    console.error('Failed to initialize Web Vitals monitoring:', error);
  }
}

// Initialize performance optimizations
export function initPerformanceOptimizations() {
  if (typeof window === 'undefined') return;

  // Run optimizations after page load
  if (document.readyState === 'complete') {
    optimizeImages();
  } else {
    window.addEventListener('load', optimizeImages);
  }

  // Monitor web vitals in development
  if (process.env.NODE_ENV === 'development') {
    monitorWebVitals();
  }
}

// Request Idle Callback wrapper for non-critical tasks
export function runWhenIdle(callback: () => void, timeout = 2000) {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, timeout);
  }
}
