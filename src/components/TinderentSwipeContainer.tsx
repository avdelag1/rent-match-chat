import { useState, useCallback, useEffect, memo, useRef, useMemo, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { triggerHaptic } from '@/utils/haptics';
import { SimpleSwipeCard, SimpleSwipeCardRef } from './SimpleSwipeCard';
import { SwipeActionButtonBar } from './SwipeActionButtonBar';
import { preloadImageToCache, isImageDecodedInCache } from './PhysicsTinderSwipeCard';

// FIX #3: Lazy-load modals to prevent them from affecting swipe tree
// These are rendered via portal outside the swipe container's React tree
const SwipeInsightsModal = lazy(() => import('./SwipeInsightsModal').then(m => ({ default: m.SwipeInsightsModal })));
const ShareDialog = lazy(() => import('./ShareDialog').then(m => ({ default: m.ShareDialog })));
import { useSmartListingMatching, ListingFilters } from '@/hooks/useSmartMatching';
import { useAuth } from '@/hooks/useAuth';
import { swipeQueue } from '@/lib/swipe/SwipeQueue';
import { imagePreloadController } from '@/lib/swipe/ImagePreloadController';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { useStartConversation } from '@/hooks/useConversations';
import { useRecordProfileView } from '@/hooks/useProfileRecycling';
import { usePrefetchImages } from '@/hooks/usePrefetchImages';
import { useSwipePrefetch, usePrefetchManager } from '@/hooks/usePrefetchManager';
import { useSwipeDeckStore, persistDeckToSession, getDeckFromSession } from '@/state/swipeDeckStore';
import { shallow } from 'zustand/shallow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RotateCcw, RefreshCw, Home, Search, Car, Bike, Anchor, Briefcase } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { logger } from '@/utils/prodLogger';

// Custom motorcycle icon
const MotorcycleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="17" r="3" />
    <circle cx="19" cy="17" r="3" />
    <path d="M9 17h6" />
    <path d="M19 17l-2-5h-4l-3-4H6l1 4" />
    <path d="M14 7h3l2 5" />
  </svg>
);

// Category configuration for dynamic empty states
const categoryConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; plural: string; color: string }> = {
  property: { icon: Home, label: 'Property', plural: 'Properties', color: 'text-primary' },
  vehicle: { icon: Car, label: 'Car', plural: 'Cars', color: 'text-blue-500' },
  yacht: { icon: Anchor, label: 'Yacht', plural: 'Yachts', color: 'text-cyan-500' },
  moto: { icon: MotorcycleIcon, label: 'Motorcycle', plural: 'Motorcycles', color: 'text-orange-500' },
  motorcycle: { icon: MotorcycleIcon, label: 'Motorcycle', plural: 'Motorcycles', color: 'text-orange-500' },
  bicycle: { icon: Bike, label: 'Bicycle', plural: 'Bicycles', color: 'text-green-500' },
  services: { icon: Briefcase, label: 'Service', plural: 'Services', color: 'text-amber-500' },
  worker: { icon: Briefcase, label: 'Worker', plural: 'Workers', color: 'text-amber-500' },
};

// Helper to get the active category display info from filters
const getActiveCategoryInfo = (filters?: ListingFilters) => {
  // Check for categories array first (from quick filters)
  const categories = filters?.categories;
  if (categories && categories.length === 1) {
    const cat = categories[0];
    return categoryConfig[cat] || categoryConfig.property;
  }

  // Check for single category
  const category = filters?.category;
  if (category) {
    return categoryConfig[category] || categoryConfig.property;
  }

  // Default to properties
  return categoryConfig.property;
};

// Debounce utility for preventing rapid-fire actions
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;
}

// Navigation guard to prevent double-taps
function useNavigationGuard() {
  const isNavigatingRef = useRef(false);
  const lastNavigationRef = useRef(0);

  const canNavigate = useCallback(() => {
    const now = Date.now();
    if (isNavigatingRef.current || now - lastNavigationRef.current < 300) {
      return false;
    }
    return true;
  }, []);

  const startNavigation = useCallback(() => {
    isNavigatingRef.current = true;
    lastNavigationRef.current = Date.now();
  }, []);

  const endNavigation = useCallback(() => {
    isNavigatingRef.current = false;
  }, []);

  return { canNavigate, startNavigation, endNavigation };
}

// =============================================================================
// PERF: Throttled prefetch scheduler - prevents competing with current decode
// Uses requestIdleCallback to ensure prefetch only runs when browser is idle
// =============================================================================
class PrefetchScheduler {
  private scheduled = false;
  private callback: (() => void) | null = null;
  private idleHandle: number | null = null;

  schedule(callback: () => void, delayMs = 300): void {
    // Cancel any pending prefetch
    this.cancel();

    this.callback = callback;
    this.scheduled = true;

    // Wait for a brief delay to let current image decode complete
    setTimeout(() => {
      if (!this.scheduled || !this.callback) return;

      if ('requestIdleCallback' in window) {
        this.idleHandle = (window as any).requestIdleCallback(() => {
          if (this.callback) this.callback();
          this.scheduled = false;
        }, { timeout: 2000 });
      } else {
        this.callback();
        this.scheduled = false;
      }
    }, delayMs);
  }

  cancel(): void {
    this.scheduled = false;
    this.callback = null;
    if (this.idleHandle !== null && 'cancelIdleCallback' in window) {
      (window as any).cancelIdleCallback(this.idleHandle);
      this.idleHandle = null;
    }
  }
}

interface TinderentSwipeContainerProps {
  onListingTap: (listingId: string) => void;
  onInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
  locationFilter?: {
    latitude: number;
    longitude: number;
    city?: string;
    radius: number;
  } | null;
  filters?: ListingFilters;
}

const TinderentSwipeContainerComponent = ({ onListingTap, onInsights, onMessageClick, locationFilter, filters }: TinderentSwipeContainerProps) => {
  const [page, setPage] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [insightsModalOpen, setInsightsModalOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshMode, setIsRefreshMode] = useState(false);

  // PERF: Get userId from auth to pass to query (avoids getUser() inside queryFn)
  const { user } = useAuth();

  // PERF: Use selective subscriptions to prevent re-renders on unrelated store changes
  // Only subscribe to actions (stable references) - NOT to clientDeck object
  // This is the key fix for "double render" feeling when navigating back to dashboard
  const setClientDeck = useSwipeDeckStore((state) => state.setClientDeck);
  const markClientSwiped = useSwipeDeckStore((state) => state.markClientSwiped);
  const resetClientDeck = useSwipeDeckStore((state) => state.resetClientDeck);
  const isClientHydrated = useSwipeDeckStore((state) => state.isClientHydrated);
  const isClientReady = useSwipeDeckStore((state) => state.isClientReady);
  const markClientReady = useSwipeDeckStore((state) => state.markClientReady);

  // Local state for immediate UI updates - drives the swipe animation
  const [currentIndex, setCurrentIndex] = useState(0);

  // =============================================================================
  // FIX #1: SWIPE PHASE ISOLATION - DOM moves first, React cleans up after
  // This is the key to "Tinder-level" feel: freeze React during the swipe gesture
  // =============================================================================
  interface PendingSwipe {
    listing: any;
    direction: 'left' | 'right';
    newIndex: number;
  }
  const pendingSwipeRef = useRef<PendingSwipe | null>(null);
  const isSwipeAnimatingRef = useRef(false);

  // PERF: Get initial state ONCE using getState() - no subscription
  // This is synchronous and doesn't cause re-renders when store updates
  const getInitialDeck = () => {
    // Try session storage first (faster, tab-scoped)
    const sessionItems = getDeckFromSession('client', 'listings');
    if (sessionItems.length > 0) {
      return sessionItems;
    }
    // Fallback to store items (persisted across sessions) - non-reactive read
    const storeState = useSwipeDeckStore.getState();
    if (storeState.clientDeck.deckItems.length > 0) {
      return storeState.clientDeck.deckItems;
    }
    return [];
  };

  // CONSTANT-TIME SWIPE DECK: Use refs for queue management (no re-renders on swipe)
  // Initialize synchronously from persisted state to prevent dark/empty cards
  // PERF: Use getState() for initial values - no subscription needed
  const deckQueueRef = useRef<any[]>(getInitialDeck());
  const currentIndexRef = useRef(useSwipeDeckStore.getState().clientDeck.currentIndex);
  const swipedIdsRef = useRef<Set<string>>(new Set(useSwipeDeckStore.getState().clientDeck.swipedIds));
  const initializedRef = useRef(deckQueueRef.current.length > 0);

  // Ref to trigger swipe animations from the fixed action buttons
  const cardRef = useRef<SimpleSwipeCardRef>(null);

  // Sync state with ref on mount
  useEffect(() => {
    setCurrentIndex(currentIndexRef.current);
  }, []);

  // PERF FIX: Track if we're returning to dashboard (has hydrated data AND is ready)
  // When true, skip initial animations to prevent "double render" feeling
  // Use isReady flag from store to determine if deck is fully initialized
  const isReturningRef = useRef(
    deckQueueRef.current.length > 0 && useSwipeDeckStore.getState().clientDeck.isReady
  );
  const hasAnimatedOnceRef = useRef(isReturningRef.current);

  // PERF FIX: Eagerly preload top 4 cards' images when we have hydrated deck data
  // This runs SYNCHRONOUSLY during component initialization (before first paint)
  // The images will be in cache when TinderSwipeCard renders, preventing any flash
  const eagerPreloadInitiatedRef = useRef(false);
  if (!eagerPreloadInitiatedRef.current && deckQueueRef.current.length > 0) {
    eagerPreloadInitiatedRef.current = true;
    const currentIdx = currentIndexRef.current;

    // Preload current + next 3 card images with decode (4 total for smooth swiping)
    [0, 1, 2, 3].forEach((offset) => {
      const cardImages = deckQueueRef.current[currentIdx + offset]?.images;
      if (cardImages?.[0]) {
        preloadImageToCache(cardImages[0]);
      }
    });
  }

  // PERF: Throttled prefetch scheduler
  const prefetchSchedulerRef = useRef(new PrefetchScheduler());

  // Fetch guards
  const isFetchingMore = useRef(false);

  // Navigation guard
  const { canNavigate, startNavigation, endNavigation } = useNavigationGuard();

  // HYDRATION SYNC: One-time sync on mount if not already initialized
  // PERF: Use getState() to check store without subscribing
  // This effect only runs once and doesn't cause re-renders on store updates
  useEffect(() => {
    if (!initializedRef.current) {
      const storeState = useSwipeDeckStore.getState();
      const hasStoreData = storeState.clientDeck.deckItems.length > 0;
      const hasSessionData = getDeckFromSession('client', 'listings').length > 0;

      if (hasStoreData || hasSessionData) {
        initializedRef.current = true;
        const items = getInitialDeck();
        if (items.length > 0 && deckQueueRef.current.length === 0) {
          deckQueueRef.current = items;
          const newIndex = storeState.clientDeck.currentIndex;
          currentIndexRef.current = newIndex;
          setCurrentIndex(newIndex);
          swipedIdsRef.current = new Set(storeState.clientDeck.swipedIds);
        }
      }
    }
  }, []); // Empty deps - only run once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      prefetchSchedulerRef.current.cancel();
    };
  }, []);

  // Hooks for functionality
  const { canAccess: hasPremiumMessaging, needsUpgrade } = useCanAccessMessaging();
  const navigate = useNavigate();
  const { recordSwipe, undoLastSwipe, canUndo, isUndoing, undoSuccess, resetUndoState } = useSwipeUndo();
  const startConversation = useStartConversation();

  // FIX: Sync local state when undo completes successfully
  useEffect(() => {
    if (undoSuccess) {
      // Get the updated state from the store
      const storeState = useSwipeDeckStore.getState();
      const newIndex = storeState.clientDeck.currentIndex;

      // Sync local refs and state with store
      currentIndexRef.current = newIndex;
      setCurrentIndex(newIndex);

      // Sync the entire swipedIds set with store (source of truth)
      swipedIdsRef.current = new Set(storeState.clientDeck.swipedIds);

      // Reset undo state so this effect doesn't run again
      resetUndoState();

      logger.info('[TinderentSwipeContainer] Synced local state after undo, new index:', newIndex);
    }
  }, [undoSuccess, resetUndoState]);
  const recordProfileView = useRecordProfileView();

  // PERF: Initialize swipeQueue with user ID for fire-and-forget background writes
  // This eliminates the async auth call on every swipe
  useEffect(() => {
    if (user?.id) {
      swipeQueue.setUserId(user.id);
    }
  }, [user?.id]);

  // PERF: Memoize filters to prevent unnecessary query re-runs
  const stableFilters = useMemo(() => filters, [
    // Only re-create when actual filter values change
    filters?.category,
    filters?.categories?.join(','),
    filters?.listingType,
    filters?.priceRange?.[0],
    filters?.priceRange?.[1],
    filters?.bedrooms?.join(','),
    filters?.bathrooms?.join(','),
    filters?.amenities?.join(','),
    filters?.propertyType?.join(','),
    filters?.petFriendly,
    filters?.furnished,
    filters?.verified,
    filters?.premiumOnly,
  ]);

  // PERF FIX: Create stable filter signature for deck versioning
  // This detects when filters actually changed vs just navigation return
  const filterSignature = useMemo(() => {
    if (!filters) return 'default';
    return [
      filters.category || '',
      filters.categories?.join(',') || '',
      filters.listingType || '',
      filters.priceRange?.join('-') || '',
      filters.bedrooms?.join(',') || '',
      filters.bathrooms?.join(',') || '',
      filters.amenities?.join(',') || '',
      filters.propertyType?.join(',') || '',
      filters.petFriendly ? '1' : '0',
      filters.furnished ? '1' : '0',
      filters.verified ? '1' : '0',
      filters.premiumOnly ? '1' : '0',
    ].join('|');
  }, [filters]);

  // Track previous filter signature to detect filter changes
  const prevFilterSignatureRef = useRef<string>(filterSignature);
  const filterChangedRef = useRef(false);

  // PERF FIX: Track previous listing IDs signature to detect actual data changes
  // Declared early so they can be used in both filter reset and data append effects
  const prevListingIdsRef = useRef<string>('');
  const hasNewListingsRef = useRef(false);

  // Detect filter changes (not navigation)
  if (filterSignature !== prevFilterSignatureRef.current) {
    filterChangedRef.current = true;
    prevFilterSignatureRef.current = filterSignature;
  }

  // PERF FIX: Reset deck ONLY when filters actually change (not on navigation return)
  // This effect uses filterSignature as dependency to detect genuine filter changes
  useEffect(() => {
    // Skip on initial mount
    if (!filterChangedRef.current) return;

    // Reset the filter changed flag
    filterChangedRef.current = false;

    // Clear deck for fresh results with new filters
    deckQueueRef.current = [];
    currentIndexRef.current = 0;
    swipedIdsRef.current.clear();
    prevListingIdsRef.current = '';
    hasNewListingsRef.current = false;
    setPage(0);

    // Clear persisted deck since filters changed
    resetClientDeck();

    // Force UI update
    currentIndexRef.current = 0;
    setCurrentIndex(0);
  }, [filterSignature, resetClientDeck]);

  // Get listings with filters - PERF: pass userId to avoid getUser() inside queryFn
  const {
    data: smartListings = [],
    isLoading: smartLoading,
    isFetching: smartFetching,
    error: smartError,
    refetch: refetchSmart
  } = useSmartListingMatching(user?.id, [], stableFilters, page, 10, isRefreshMode);

  const isLoading = smartLoading;
  const isFetching = smartFetching;
  const error = smartError;

  // PERF FIX: Cheap signature using first ID + last ID + length (avoids expensive join)
  // This prevents unnecessary deck updates when React Query returns same data with new reference
  const listingIdsSignature = useMemo(() => {
    if (smartListings.length === 0) return '';
    return `${smartListings[0]?.id || ''}_${smartListings[smartListings.length - 1]?.id || ''}_${smartListings.length}`;
  }, [smartListings]);

  // Determine if we have genuinely new data (not just reference change)
  if (listingIdsSignature !== prevListingIdsRef.current && listingIdsSignature.length > 0) {
    const currentIds = new Set(deckQueueRef.current.map(l => l.id));
    const newIds = smartListings.filter(l => !currentIds.has(l.id) && !swipedIdsRef.current.has(l.id));
    hasNewListingsRef.current = newIds.length > 0;
    prevListingIdsRef.current = listingIdsSignature;
  }

  // Prefetch images for next cards (3 profiles ahead for smoother swiping)
  // PERF: Use currentIndex state as trigger (re-runs when index changes)
  usePrefetchImages({
    currentIndex: currentIndex,
    profiles: deckQueueRef.current,
    prefetchCount: 3,
    trigger: currentIndex
  });

  // Prefetch next batch of listings when approaching end of current batch
  // Uses requestIdleCallback internally for non-blocking prefetch
  useSwipePrefetch(
    currentIndexRef.current,
    page,
    deckQueueRef.current.length,
    stableFilters as unknown
  );

  // PERFORMANCE: Prefetch next listing details when viewing current card
  // This pre-loads the data for the insights dialog
  // PERF: Guard with route check - skip expensive work when navigated away
  // PERF: Use throttled scheduler to not compete with current image decode
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');
  const { prefetchListingDetails } = usePrefetchManager();

  useEffect(() => {
    // Skip expensive prefetch when not on dashboard - reduces CPU during route transitions
    if (!isDashboard) return;

    const nextListing = deckQueueRef.current[currentIndex + 1];
    if (nextListing?.id) {
      // PERF: Use throttled scheduler - waits 300ms then uses requestIdleCallback
      // This ensures prefetch doesn't compete with current image decoding
      prefetchSchedulerRef.current.schedule(() => {
        prefetchListingDetails(nextListing.id);
      }, 300);
    }

    return () => {
      prefetchSchedulerRef.current.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, prefetchListingDetails, isDashboard]); // currentIndex updates on each swipe, triggering reliable prefetch

  // CONSTANT-TIME: Append new unique listings to queue AND persist to store
  // PERF FIX: Only run when we have genuinely new listings (not just reference change)
  // Uses listingIdsSignature for stable dependency instead of smartListings array
  useEffect(() => {
    // Guard: Only process if we have new data and not in initial loading state
    if (!hasNewListingsRef.current || isLoading) {
      // Still reset the fetching flag when loading completes
      if (!isLoading && !isFetching) {
        isFetchingMore.current = false;
      }
      return;
    }

    // Reset the new listings flag
    hasNewListingsRef.current = false;

    const existingIds = new Set(deckQueueRef.current.map(l => l.id));
    const newListings = smartListings.filter(l =>
      !existingIds.has(l.id) && !swipedIdsRef.current.has(l.id)
    );

    if (newListings.length > 0) {
      deckQueueRef.current = [...deckQueueRef.current, ...newListings];
      // Cap at 50 listings
      if (deckQueueRef.current.length > 50) {
        const offset = deckQueueRef.current.length - 50;
        deckQueueRef.current = deckQueueRef.current.slice(offset);
        const newIndex = Math.max(0, currentIndexRef.current - offset);
        currentIndexRef.current = newIndex;
        setCurrentIndex(newIndex);
      }

      // PERSIST: Save to store and session for navigation survival
      setClientDeck(deckQueueRef.current, true);
      persistDeckToSession('client', 'listings', deckQueueRef.current);

      // PERF: Mark deck as ready for instant return on re-navigation
      // This ensures that when user returns to dashboard, we skip all initialization
      if (!isClientReady()) {
        markClientReady();
      }
    }

    isFetchingMore.current = false;
  }, [listingIdsSignature, isLoading, isFetching, smartListings, setClientDeck, isClientReady, markClientReady]);

  // Get current visible cards for 2-card stack (top + next)
  // Use currentIndex from state (already synced with currentIndexRef)
  const deckQueue = deckQueueRef.current;
  // Add bounds checking to prevent rendering with invalid indices
  const safeIndex = Math.min(currentIndex, Math.max(0, deckQueue.length - 1));
  const topCard = deckQueue.length > 0 ? deckQueue[safeIndex] : null;
  const nextCard = deckQueue.length > safeIndex + 1 ? deckQueue[safeIndex + 1] : null;

  // =============================================================================
  // FIX #1: SWIPE PHASE ISOLATION - Two-phase swipe for Tinder-level feel
  // PHASE 1 (0-200ms): DOM only - card flies away, React is frozen
  // PHASE 2 (after animation): Flush all state to React/Zustand/persistence
  // =============================================================================

  // PHASE 2: Called AFTER animation completes - flush all pending state
  const flushPendingSwipe = useCallback(() => {
    const pending = pendingSwipeRef.current;
    if (!pending) return;

    const { listing, direction, newIndex } = pending;

    // Clear pending immediately to prevent double-flush
    pendingSwipeRef.current = null;
    isSwipeAnimatingRef.current = false;

    // NOW it's safe to update React state - animation is done
    setCurrentIndex(newIndex);

    // Update local ref for swiped IDs (already done in phase 1, but ensure consistency)
    swipedIdsRef.current.add(listing.id);

    // Fire-and-forget: Queue swipe for background DB processing
    swipeQueue.queueSwipe(listing.id, direction, 'listing');

    // Zustand update - DEFERRED until animation complete
    markClientSwiped(listing.id);

    // Record for undo
    recordSwipe(listing.id, 'listing', direction === 'right' ? 'like' : 'pass');

    // FIX #2: DEFERRED PERSISTENCE - use requestIdleCallback
    // This prevents sessionStorage from blocking the main thread
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        persistDeckToSession('client', 'listings', deckQueueRef.current);
      }, { timeout: 2000 });
    } else {
      // Fallback: defer to next frame at minimum
      setTimeout(() => {
        persistDeckToSession('client', 'listings', deckQueueRef.current);
      }, 0);
    }

    // Background: Profile view recording (non-critical, fire-and-forget)
    queueMicrotask(() => {
      recordProfileView.mutateAsync({
        profileId: listing.id,
        viewType: 'listing',
        action: direction === 'right' ? 'like' : 'pass'
      }).catch(() => {});
    });

    // Clear direction for next swipe
    setSwipeDirection(null);

    // Fetch more if running low
    if (newIndex >= deckQueueRef.current.length - 3 && !isFetchingMore.current) {
      isFetchingMore.current = true;
      setPage(p => p + 1);
    }

    // Eagerly preload next card's image using both preloaders
    const nextNextCard = deckQueueRef.current[newIndex + 1];
    if (nextNextCard?.images?.[0]) {
      preloadImageToCache(nextNextCard.images[0]);
      imagePreloadController.preload(nextNextCard.images[0], 'high');
    }
  }, [recordSwipe, recordProfileView, markClientSwiped]);

  // PHASE 1: Called when user swipes - ONLY updates refs and triggers animation
  // NO React state updates, NO Zustand updates, NO persistence
  const executeSwipe = useCallback((direction: 'left' | 'right') => {
    // Prevent double-swipe while animation is in progress
    if (isSwipeAnimatingRef.current) return;

    const listing = deckQueueRef.current[currentIndexRef.current];
    if (!listing) return;

    const newIndex = currentIndexRef.current + 1;

    // PHASE 1: Only update refs and trigger animation
    // NO setCurrentIndex, NO markClientSwiped, NO persistence
    isSwipeAnimatingRef.current = true;
    pendingSwipeRef.current = { listing, direction, newIndex };

    // Update ONLY the refs (no React re-render)
    currentIndexRef.current = newIndex;
    swipedIdsRef.current.add(listing.id);

    // Trigger exit animation direction (this is the ONLY React state we touch)
    setSwipeDirection(direction);

    // SAFETY NET: If animation callback doesn't fire within 350ms, force flush
    // This prevents stuck state if onAnimationComplete fails
    setTimeout(() => {
      if (pendingSwipeRef.current?.listing.id === listing.id) {
        flushPendingSwipe();
      }
    }, 350);
  }, [flushPendingSwipe]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const listing = deckQueueRef.current[currentIndexRef.current];
    if (!listing) return;

    // Immediate haptic feedback
    triggerHaptic(direction === 'right' ? 'success' : 'warning');

    // INSTANT SWIPE: Always execute immediately - never block on image prefetch
    // The next card will show with skeleton placeholder until image loads
    executeSwipe(direction);

    // BACKGROUND PREFETCH: Opportunistically prefetch next 3-4 cards in background
    // This doesn't block the swipe - images load with graceful skeleton fallback
    // Use BOTH preloaders for maximum cache coverage
    const imagesToPreload: string[] = [];
    [1, 2, 3, 4].forEach((offset) => {
      const futureCard = deckQueueRef.current[currentIndexRef.current + offset];
      if (futureCard?.images?.[0]) {
        imagesToPreload.push(futureCard.images[0]);
        preloadImageToCache(futureCard.images[0]);
      }
    });

    // Batch preload with ImagePreloadController (decodes images for instant display)
    if (imagesToPreload.length > 0) {
      imagePreloadController.preloadBatch(imagesToPreload);
    }
  }, [executeSwipe]);

  // Button-triggered swipe - animates the card via ref
  const handleButtonLike = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.triggerSwipe('right');
    }
  }, []);

  const handleButtonDislike = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.triggerSwipe('left');
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsRefreshMode(true);
    triggerHaptic('medium');

    // Reset local state and refs
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    deckQueueRef.current = [];
    swipedIdsRef.current.clear();
    setPage(0);

    // Reset store
    resetClientDeck();

    try {
      await refetchSmart();
      toast({
        title: 'Properties Refreshed',
        description: 'Showing properties you passed on. Liked ones stay saved!',
      });
    } catch (err) {
      toast({
        title: 'Refresh Failed',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleInsights = () => {
    setInsightsModalOpen(true);
    triggerHaptic('light');
  };

  const handleShare = () => {
    setShareDialogOpen(true);
    triggerHaptic('light');
  };

  const handleMessage = async () => {
    const listing = deckQueueRef.current[currentIndexRef.current];

    if (!canNavigate()) return;

    if (!listing?.owner_id || isCreatingConversation) {
      toast({
        title: 'Cannot Start Conversation',
        description: 'Owner information not available.',
      });
      return;
    }

    if (needsUpgrade) {
      startNavigation();
      navigate('/client/settings#subscription');
      toast({
        title: 'Subscription Required',
        description: 'Upgrade to message property owners.',
      });
      setTimeout(endNavigation, 500);
      return;
    }

    if (!hasPremiumMessaging) {
      startNavigation();
      navigate('/client/settings#subscription');
      setTimeout(endNavigation, 500);
      return;
    }

    setIsCreatingConversation(true);
    startNavigation();

    try {
      toast({
        title: 'Creating conversation...',
        description: 'Please wait'
      });

      const result = await startConversation.mutateAsync({
        otherUserId: listing.owner_id,
        listingId: listing.id,
        initialMessage: `Hi! I'm interested in your property: ${listing.title}`,
        canStartNewConversation: true,
      });

      if (result?.conversationId) {
        toast({
          title: 'Conversation created!',
          description: 'Opening chat...'
        });
        navigate(`/messages?conversationId=${result.conversationId}`);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        logger.error('[TinderentSwipe] Error starting conversation:', err);
      }
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not start conversation',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingConversation(false);
      endNavigation();
    }
  };

  const progress = deckQueue.length > 0 ? ((currentIndex + 1) / deckQueue.length) * 100 : 0;

  // Check if we have hydrated data (from store/session) - prevents blank deck flash
  // isReady means we've fully initialized at least once - skip loading UI on return
  const hasHydratedData = isClientHydrated() || isClientReady() || deckQueue.length > 0;

  // STABLE LOADING SHELL: Only show full skeleton if NOT hydrated AND loading
  // Once hydrated or ready, never show full skeleton again (use placeholderData from query)
  // PERF: GPU-accelerated skeleton to match card styling
  if (!hasHydratedData && isLoading) {
    return (
      <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex flex-col px-3">
        <div className="relative flex-1 w-full">
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden"
            style={{
              transform: 'translateZ(0)',
              contain: 'paint',
            }}
          >
            {/* Base gradient - matches TinderSwipeCard skeleton */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 35%, #cbd5e1 65%, #94a3b8 100%)',
              }}
            />
            {/* Animated shimmer - GPU accelerated */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 75%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-shimmer 1.2s ease-in-out infinite',
                willChange: 'background-position',
                transform: 'translateZ(0)',
              }}
            />
            {/* Story dots placeholder */}
            <div className="absolute top-3 left-0 right-0 z-30 flex justify-center gap-1 px-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={`skeleton-dot-${num}`} className="flex-1 h-1 rounded-full bg-white/30" />
              ))}
            </div>
            {/* Bottom sheet skeleton */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 rounded-t-[24px] p-4 pt-6">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-1.5 bg-white/30 rounded-full" />
              </div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-white/20 rounded-lg" />
                  <div className="h-4 w-1/2 bg-white/15 rounded-lg" />
                </div>
                <div className="text-right space-y-1">
                  <div className="h-6 w-20 bg-white/20 rounded-lg" />
                  <div className="h-3 w-12 bg-white/15 rounded-lg ml-auto" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-4 w-12 bg-white/15 rounded-full" />
                <div className="h-4 w-12 bg-white/15 rounded-full" />
                <div className="h-4 w-16 bg-white/15 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        {/* Action buttons skeleton */}
        <div className="flex-shrink-0 flex justify-center items-center py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-muted/40 animate-pulse" />
            <div className="w-11 h-11 rounded-full bg-muted/30 animate-pulse" />
            <div className="w-11 h-11 rounded-full bg-muted/30 animate-pulse" />
            <div className="w-14 h-14 rounded-full bg-muted/40 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // FIX: Check "All Caught Up" BEFORE error state to prevent showing errors
  // when user has swiped through all cards (fetch error for next batch is not critical)
  if (currentIndex >= deckQueue.length && deckQueue.length > 0) {
    const categoryInfo = getActiveCategoryInfo(filters);
    const CategoryIcon = categoryInfo.icon;
    return (
      <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center space-y-6 p-8"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}>
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full flex items-center justify-center">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <CategoryIcon className={`w-12 h-12 ${categoryInfo.color}`} />
              </motion.div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">All Caught Up!</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              You've seen all available {categoryInfo.plural.toLowerCase()}. Check back later or refresh for new listings.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2 rounded-full px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg text-base"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? `Finding ${categoryInfo.plural}...` : 'Discover More'}
              </Button>
            </motion.div>
            <p className="text-xs text-muted-foreground">New {categoryInfo.plural.toLowerCase()} are added daily</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Error state - ONLY show if we have NO cards at all (not when deck is exhausted)
  if (error && deckQueue.length === 0) {
    const categoryInfo = getActiveCategoryInfo(filters);
    return (
      <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex items-center justify-center">
        <Card className="text-center bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20 p-8">
          <div className="text-6xl mb-4">:(</div>
          <h3 className="text-xl font-bold mb-2">Oops! Something went wrong</h3>
          <p className="text-muted-foreground mb-4">We couldn't load {categoryInfo.plural.toLowerCase()} right now.</p>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Empty state - dynamic based on category (no cards fetched yet)
  if (deckQueue.length === 0) {
    const categoryInfo = getActiveCategoryInfo(filters);
    const CategoryIcon = categoryInfo.icon;
    return (
      <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center space-y-6 p-8"
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <CategoryIcon className={`w-12 h-12 ${categoryInfo.color}`} />
            </div>
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">No {categoryInfo.plural} Found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Try adjusting your filters or refresh to discover new listings
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2 rounded-full px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Loading...' : `Refresh ${categoryInfo.plural}`}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // PREMIUM: Hover-based prefetch - prefetch next batch when user hovers near bottom of deck
  const handleDeckHover = useCallback(() => {
    // Only prefetch if we're running low and not already fetching
    const remainingCards = deckQueueRef.current.length - currentIndexRef.current;
    if (remainingCards <= 5 && !isFetchingMore.current) {
      isFetchingMore.current = true;
      setPage(p => p + 1);

      // Also preload next 4 card images opportunistically using BOTH preloaders
      const imagesToPreload: string[] = [];
      [1, 2, 3, 4].forEach((offset) => {
        const futureCard = deckQueueRef.current[currentIndexRef.current + offset];
        if (futureCard?.images?.[0]) {
          imagesToPreload.push(futureCard.images[0]);
          preloadImageToCache(futureCard.images[0]);
        }
      });

      // Use ImagePreloadController for decode (ensures GPU-ready images)
      if (imagesToPreload.length > 0) {
        imagePreloadController.preloadBatch(imagesToPreload);
      }
    }
  }, []);

  // Main swipe view - edge-to-edge cards
  return (
    <div
      className="relative w-full h-full flex-1 flex flex-col max-w-lg mx-auto"
      onMouseEnter={handleDeckHover}
    >
      <div className="relative flex-1 w-full">
        {/* Single card - no background placeholder layer */}

        {/* Current card on top - fully interactive */}
        {/* Physics engine handles ALL animations - no Framer Motion wrapper needed */}
        {topCard && (
          <div
            key={topCard.id}
            className="w-full h-full absolute inset-0"
            style={{ zIndex: 10 }}
          >
            <SimpleSwipeCard
              ref={cardRef}
              listing={topCard}
              onSwipe={handleSwipe}
              onTap={() => onListingTap(topCard.id)}
              onInsights={handleInsights}
              isTop={true}
            />
          </div>
        )}
      </div>

      {/* Fixed action buttons - stay in place while cards animate above */}
      {topCard && !insightsModalOpen && (
        <div className="flex-shrink-0 flex justify-center items-center py-3 px-4">
          <SwipeActionButtonBar
            onLike={handleButtonLike}
            onDislike={handleButtonDislike}
            onShare={handleShare}
            onUndo={undoLastSwipe}
            onMessage={handleMessage}
            canUndo={canUndo}
          />
        </div>
      )}

      {/* FIX #3: PORTAL ISOLATION - Modals render outside swipe tree
          This prevents modal state changes from causing re-renders in the swipe container
          The modal lives in a completely separate React subtree */}
      {typeof document !== 'undefined' && createPortal(
        <Suspense fallback={null}>
          {insightsModalOpen && (
            <SwipeInsightsModal
              open={insightsModalOpen}
              onOpenChange={setInsightsModalOpen}
              listing={topCard}
            />
          )}
          {shareDialogOpen && topCard && (
            <ShareDialog
              open={shareDialogOpen}
              onOpenChange={setShareDialogOpen}
              listingId={topCard.id}
              title={topCard.title || 'Check out this listing'}
              description={topCard.description}
            />
          )}
        </Suspense>,
        document.body
      )}
    </div>
  );
};

export const TinderentSwipeContainer = memo(TinderentSwipeContainerComponent);
