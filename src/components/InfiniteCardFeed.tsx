/**
 * Infinite Card Feed Component
 * Tinder/Instagram-style vertical scrolling feed with swipe gestures
 * Supports both listings (client view) and profiles (owner view)
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedSwipeCard } from './EnhancedSwipeCard';
import { ClientProfileCard } from './ClientProfileCard';
import { Loader2 } from 'lucide-react';
import { useInfiniteListings, flattenListings } from '@/hooks/useInfiniteListings';
import { useInfiniteProfiles, flattenProfiles } from '@/hooks/useInfiniteProfiles';
import { useSwipeWithMatch } from '@/hooks/useSwipeWithMatch';
import { trackSwipe, trackSuperLike, trackDetailView, trackEventDebounced } from '@/utils/analytics';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { Database } from '@/integrations/supabase/types';

type Listing = Database['public']['Tables']['listings']['Row'];

interface InfiniteCardFeedProps {
  mode: 'client' | 'owner'; // client = browse listings, owner = browse profiles
  onCardTap?: (item: any) => void;
  onMessage?: (item: any) => void;
  filters?: any;
  className?: string;
}

/**
 * Main infinite card feed component
 */
export function InfiniteCardFeed({
  mode,
  onCardTap,
  onMessage,
  filters,
  className = ''
}: InfiniteCardFeedProps) {
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for infinite scroll trigger
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  });

  // Fetch data based on mode
  const listingsQuery = useInfiniteListings({
    pageSize: 10,
    excludeSwipedIds: Array.from(swipedIds),
    filters: mode === 'client' ? filters : undefined,
    enabled: mode === 'client'
  });

  const profilesQuery = useInfiniteProfiles({
    pageSize: 10,
    excludeSwipedIds: Array.from(swipedIds),
    filters: mode === 'owner' ? filters : undefined,
    enabled: mode === 'owner'
  });

  // Get appropriate query based on mode
  const query = mode === 'client' ? listingsQuery : profilesQuery;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = query;

  // Flatten data
  const items = mode === 'client'
    ? flattenListings(listingsQuery.data?.pages)
    : flattenProfiles(profilesQuery.data);

  // Swipe mutation
  const swipeMutation = useSwipeWithMatch();

  // Load more when scrolling near end
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Track impressions (debounced)
  useEffect(() => {
    if (items.length > 0 && currentIndex < items.length) {
      const item = items[currentIndex];
      const itemId = mode === 'client' ? (item as Listing).id : (item as any).user_id;

      trackEventDebounced('page_view', {
        item_type: mode === 'client' ? 'listing' : 'profile',
        item_id: itemId,
        position: currentIndex
      }, 2000);
    }
  }, [currentIndex, items, mode]);

  /**
   * Handle swipe action
   */
  const handleSwipe = useCallback(
    async (direction: 'left' | 'right', item: any) => {
      const itemId = mode === 'client' ? item.id : item.user_id;

      // Add to swiped set immediately for optimistic UI
      setSwipedIds(prev => new Set(prev).add(itemId));

      // Track analytics
      trackSwipe(
        direction,
        mode === 'client' ? 'listing' : 'profile',
        itemId
      );

      // Move to next card
      setCurrentIndex(prev => prev + 1);

      // Perform swipe mutation
      try {
        await swipeMutation.mutateAsync({
          targetId: itemId,
          direction,
          targetType: mode === 'client' ? 'listing' : 'profile'
        });
      } catch (error) {
        console.error('Swipe error:', error);
        // Remove from swiped set on error
        setSwipedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        setCurrentIndex(prev => Math.max(0, prev - 1));
      }
    },
    [mode, swipeMutation]
  );

  /**
   * Handle super like
   */
  const handleSuperLike = useCallback(
    async (item: any) => {
      const itemId = mode === 'client' ? item.id : item.user_id;

      // Track analytics
      trackSuperLike(mode === 'client' ? 'listing' : 'profile', itemId);

      // Perform super like (same as right swipe but with special flag)
      await handleSwipe('right', item);
    },
    [handleSwipe, mode]
  );

  /**
   * Handle card tap (open detail)
   */
  const handleCardTap = useCallback(
    (item: any) => {
      const itemId = mode === 'client' ? item.id : item.user_id;
      const itemTitle = mode === 'client' ? item.title : item.full_name;

      // Track analytics
      trackDetailView(
        mode === 'client' ? 'listing' : 'profile',
        itemId,
        itemTitle
      );

      // Call parent handler
      onCardTap?.(item);
    },
    [mode, onCardTap]
  );

  /**
   * Handle message button
   */
  const handleMessage = useCallback(
    (item: any) => {
      onMessage?.(item);
    },
    [onMessage]
  );

  /**
   * Keyboard navigation
   */
  useKeyboardNavigation({
    onLeft: () => {
      if (currentIndex < items.length) {
        handleSwipe('left', items[currentIndex]);
      }
    },
    onRight: () => {
      if (currentIndex < items.length) {
        handleSwipe('right', items[currentIndex]);
      }
    },
    onEnter: () => {
      if (currentIndex < items.length) {
        handleCardTap(items[currentIndex]);
      }
    },
    onUp: () => {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    },
    onDown: () => {
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    },
    enabled: true
  });

  // Prefetch next item data on hover (optional optimization)
  const handleCardHover = useCallback((item: any, index: number) => {
    // Prefetch logic can be added here
    // e.g., preload images, fetch additional data
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
        <h3 className="text-2xl font-bold mb-2">No More Cards</h3>
        <p className="text-muted-foreground">
          {mode === 'client'
            ? "You've seen all available properties. Check back later for new listings!"
            : "You've seen all available profiles. Check back later for new tenants!"}
        </p>
      </div>
    );
  }

  // Get visible items (current + next 2 for stacking effect)
  const visibleItems = items.slice(currentIndex, currentIndex + 3);

  return (
    <div
      ref={containerRef}
      className={`w-full h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth ${className}`}
      role="feed"
      aria-label={mode === 'client' ? 'Property listings feed' : 'Tenant profiles feed'}
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Vertical Scrolling Cards */}
      {items.map((item, index) => {
        const itemId = mode === 'client' ? (item as Listing).id : (item as any).user_id;
        
        return (
          <div
            key={itemId}
            ref={index === items.length - 3 ? loadMoreRef : undefined}
            className="h-screen snap-start snap-always flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md h-[85vh]">
              {mode === 'client' ? (
                <EnhancedSwipeCard
                  listing={item as Listing}
                  onSwipe={(direction) => handleSwipe(direction, item)}
                  onTap={() => handleCardTap(item)}
                  onSuperLike={() => handleSuperLike(item)}
                  onMessage={() => handleMessage(item)}
                  isTop={true}
                  hasPremium={false}
                />
              ) : (
                <ClientProfileCard
                  profile={item as any}
                  onSwipe={(direction) => handleSwipe(direction, item)}
                  onTap={() => handleCardTap(item)}
                  onSuperLike={() => handleSuperLike(item)}
                  onMessage={() => handleMessage(item)}
                  isTop={true}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* Loading indicator for next page */}
      {isFetchingNextPage && (
        <div className="h-20 flex items-center justify-center">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading more...
          </div>
        </div>
      )}

      {/* End of feed message */}
      {!hasNextPage && items.length > 0 && (
        <div className="h-20 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">You've seen all available cards</p>
        </div>
      )}
    </div>
  );
}

export default InfiniteCardFeed;
