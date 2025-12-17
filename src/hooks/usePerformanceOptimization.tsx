import { useEffect, useCallback } from 'react';
import { rafThrottle, measurePerformance } from '@/utils/optimizedPerformance';

export function usePerformanceOptimization() {
  // Monitor frame rate and performance
  useEffect(() => {
    let frameCount = 0;
    let lastTime = Date.now();
    let animationFrameId: number | null = null;
    let isRunning = true;

    const measureFPS = () => {
      if (!isRunning) return;

      frameCount++;
      const currentTime = Date.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        if (import.meta.env.DEV && fps < 30) {
          // Low FPS warning would go here
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    // Cleanup: cancel animation frame on unmount
    return () => {
      isRunning = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
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
    if (import.meta.env.DEV && 'gc' in window) {
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