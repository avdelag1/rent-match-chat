import { useState, useCallback, useRef, useEffect } from 'react';
import { triggerHaptic } from '@/utils/haptics';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Pull distance to trigger refresh
  resistance?: number; // How hard to pull (0-1, lower = harder)
  disabled?: boolean;
}

interface UsePullToRefreshReturn {
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
  isTriggered: boolean; // True when threshold is reached
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
  indicatorStyle: React.CSSProperties;
}

/**
 * iOS-grade pull-to-refresh hook
 *
 * Features:
 * - Resistance-based pull feel (harder to pull = more iOS-like)
 * - Haptic feedback at threshold
 * - Smooth spring animation on release
 * - Loading spinner at top
 *
 * Usage:
 * ```tsx
 * const { handlers, pullDistance, isRefreshing, indicatorStyle } = usePullToRefresh({
 *   onRefresh: async () => {
 *     await refetch();
 *   }
 * });
 *
 * <div {...handlers}>
 *   <RefreshIndicator style={indicatorStyle} isRefreshing={isRefreshing} />
 *   <ScrollArea>...</ScrollArea>
 * </div>
 * ```
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 0.4,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);

  const startY = useRef(0);
  const currentY = useRef(0);
  const triggeredRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;

    // Only start pull if at top of scroll container
    const target = e.currentTarget;
    if (target.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
    setIsPulling(true);
    triggeredRef.current = false;
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const delta = currentY.current - startY.current;

    // Only allow pull down
    if (delta < 0) {
      setPullDistance(0);
      return;
    }

    // Apply resistance for iOS feel (diminishing returns)
    const resistedDelta = delta * resistance * (1 - Math.min(delta / 300, 0.5));
    setPullDistance(resistedDelta);

    // Trigger haptic when crossing threshold
    if (resistedDelta >= threshold && !triggeredRef.current) {
      triggeredRef.current = true;
      setIsTriggered(true);
      triggerHaptic('medium');
    } else if (resistedDelta < threshold && triggeredRef.current) {
      triggeredRef.current = false;
      setIsTriggered(false);
    }
  }, [isPulling, disabled, isRefreshing, resistance, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold); // Hold at threshold during refresh
      triggerHaptic('success');

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setIsTriggered(false);
        // Animate back to 0
        setPullDistance(0);
      }
    } else {
      // Spring back
      setPullDistance(0);
      setIsTriggered(false);
    }
  }, [isPulling, disabled, pullDistance, threshold, isRefreshing, onRefresh]);

  // Reset on unmount
  useEffect(() => {
    return () => {
      setPullDistance(0);
      setIsRefreshing(false);
      setIsPulling(false);
      setIsTriggered(false);
    };
  }, []);

  // Indicator style with iOS-like spring animation
  const indicatorStyle: React.CSSProperties = {
    transform: `translateY(${pullDistance}px) scale(${Math.min(pullDistance / threshold, 1)})`,
    opacity: Math.min(pullDistance / (threshold * 0.5), 1),
    transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s',
  };

  return {
    pullDistance,
    isRefreshing,
    isPulling,
    isTriggered,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    indicatorStyle,
  };
}

/**
 * Pull-to-refresh indicator component
 * Shows a spinner that scales/rotates as user pulls
 */
export function PullToRefreshIndicator({
  style,
  isRefreshing,
  isTriggered,
}: {
  style: React.CSSProperties;
  isRefreshing: boolean;
  isTriggered: boolean;
}) {
  return (
    <div
      className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-50"
      style={{
        height: 60,
        ...style,
      }}
    >
      <div
        className={`w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary flex items-center justify-center ${
          isRefreshing ? 'animate-spin' : ''
        } ${isTriggered ? 'bg-primary/10' : ''}`}
        style={{
          transition: 'background-color 0.15s',
        }}
      >
        {isTriggered && !isRefreshing && (
          <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </div>
    </div>
  );
}
