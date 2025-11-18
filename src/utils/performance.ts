// Performance optimization utilities

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