import { useEffect, useCallback } from 'react';
import { rafThrottle, measurePerformance } from '@/utils/optimizedPerformance';

export function usePerformanceOptimization() {
  // Monitor frame rate and performance
  useEffect(() => {
    let frameCount = 0;
    let lastTime = Date.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = Date.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`FPS: ${fps}`);
          
          if (fps < 30) {
            console.warn('Low FPS detected. Consider reducing animations.');
          }
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }, []);

  // Optimized scroll handler
  const createOptimizedScrollHandler = useCallback(
    (handler: (event: Event) => void) => rafThrottle(handler),
    []
  );

  // Optimized resize handler  
  const createOptimizedResizeHandler = useCallback(
    (handler: (event: Event) => void) => rafThrottle(handler),
    []
  );

  // Memory cleanup utility
  const performMemoryCleanup = useCallback(() => {
    // Clear any lingering timeouts or intervals
    const highestTimeoutId = window.setTimeout(() => {}, 0);
    for (let i = 0; i < Number(highestTimeoutId); i++) {
      clearTimeout(i);
    }
    
    // Force garbage collection in development
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      (window as any).gc();
    }
  }, []);

  return {
    createOptimizedScrollHandler,
    createOptimizedResizeHandler,
    performMemoryCleanup,
    measurePerformance
  };
}