import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

interface UseVirtualizedListOptions<T> {
  items: T[];
  itemHeight: number; // Height of each item in pixels
  containerHeight: number; // Visible container height
  overscan?: number; // Extra items to render above/below viewport
}

interface UseVirtualizedListReturn<T> {
  virtualItems: Array<{
    item: T;
    index: number;
    style: React.CSSProperties;
  }>;
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
  scrollTo: (index: number) => void;
  scrollToTop: () => void;
}

/**
 * Lightweight virtualized list hook for iOS-grade scroll performance
 *
 * Features:
 * - Only renders visible items + overscan buffer
 * - Fixed item heights for predictable scrolling
 * - Smooth 60fps scrolling with GPU acceleration
 * - Memory-efficient for lists with 1000+ items
 *
 * Usage:
 * ```tsx
 * const { virtualItems, totalHeight, containerRef } = useVirtualizedList({
 *   items: conversations,
 *   itemHeight: 72,
 *   containerHeight: window.innerHeight - 120,
 *   overscan: 5,
 * });
 *
 * <div ref={containerRef} className="overflow-y-auto" style={{ height: containerHeight }}>
 *   <div style={{ height: totalHeight, position: 'relative' }}>
 *     {virtualItems.map(({ item, index, style }) => (
 *       <ConversationItem key={item.id} conversation={item} style={style} />
 *     ))}
 *   </div>
 * </div>
 * ```
 */
export function useVirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
}: UseVirtualizedListOptions<T>): UseVirtualizedListReturn<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const { startIndex, endIndex, virtualItems } = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + visibleCount, items.length - 1);

    // Add overscan
    const startWithOverscan = Math.max(0, start - overscan);
    const endWithOverscan = Math.min(items.length - 1, end + overscan);

    // Create virtual items with absolute positioning
    const virtual: Array<{
      item: T;
      index: number;
      style: React.CSSProperties;
    }> = [];

    for (let i = startWithOverscan; i <= endWithOverscan; i++) {
      virtual.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: itemHeight,
          transform: `translateY(${i * itemHeight}px)`,
          willChange: 'transform',
        },
      });
    }

    return {
      startIndex: startWithOverscan,
      endIndex: endWithOverscan,
      virtualItems: virtual,
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  // Handle scroll with RAF for smooth performance
  const rafRef = useRef<number>();

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    });
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll]);

  // Scroll to specific index
  const scrollTo = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * itemHeight,
        behavior: 'smooth',
      });
    }
  }, [itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, []);

  const totalHeight = items.length * itemHeight;

  return {
    virtualItems,
    totalHeight,
    containerRef,
    scrollTo,
    scrollToTop,
  };
}

/**
 * Simpler hook for infinite scroll / pagination
 * Triggers callback when user scrolls near bottom
 */
interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // Pixels from bottom to trigger
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 200,
}: UseInfiniteScrollOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore || loadingRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold) {
      loadingRef.current = true;
      onLoadMore();
      // Reset after a short delay to prevent rapid firing
      setTimeout(() => {
        loadingRef.current = false;
      }, 500);
    }
  }, [onLoadMore, hasMore, isLoading, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { containerRef };
}
