import { useState, useCallback, useEffect, memo, useMemo, useRef } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { TinderSwipeCard } from './TinderSwipeCard';
import { SwipeInsightsModal } from './SwipeInsightsModal';
import { ShareDialog } from './ShareDialog';
import { useListings } from '@/hooks/useListings';
import { useSmartListingMatching, ListingFilters } from '@/hooks/useSmartMatching';
import { useSwipe } from '@/hooks/useSwipe';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { useStartConversation } from '@/hooks/useConversations';
import { useRecordProfileView } from '@/hooks/useProfileRecycling';
import { usePrefetchImages } from '@/hooks/usePrefetchImages';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RotateCcw, RefreshCw, Home, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Debounce utility for preventing rapid-fire actions
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
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
    // Prevent navigation if already navigating or within 300ms cooldown
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [allListings, setAllListings] = useState<any[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [insightsModalOpen, setInsightsModalOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  // FIX: Move swipedIds to ref to avoid re-renders on every swipe
  const swipedIdsRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState(0); // Only used when we need to refresh the visible list
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshMode, setIsRefreshMode] = useState(false); // When true, show disliked listings within cooldown

  // Fetch guards to prevent infinite loops
  const isFetchingMore = useRef(false);
  const lastFetchedPage = useRef(-1);

  // Navigation guard to prevent double-tap issues
  const { canNavigate, startNavigation, endNavigation } = useNavigationGuard();

  // Get listings with filters applied and pagination
  // isRefreshMode = true shows disliked listings within 3-day cooldown, but NEVER liked listings
  // Smart matching properly filters out:
  // - Liked items (right swipes) - NEVER shown again
  // - Disliked items (left swipes) - hidden normally, can be refreshed within 3 days
  // - Permanently hidden items (dislikes > 3 days old) - NEVER shown again
  const {
    data: smartListings = [],
    isLoading: smartLoading,
    error: smartError,
    isRefetching: smartRefetching,
    refetch: refetchSmart
  } = useSmartListingMatching([], filters, page, 10, isRefreshMode);

  // Note: We no longer use regularListings as fallback because it doesn't
  // properly filter out liked/disliked items. Smart matching is the sole source.
  const {
    refetch: refetchRegular
  } = useListings([], { enabled: false }); // Disabled, only used for refetch

  // FIX: Optimized listings derivation
  // - Uses ref for swipedIds (no re-render on swipe)
  // - Only re-computes when allListings or smartListings actually change
  const listings = useMemo(() => {
    const baseListings = allListings.length > 0 ? allListings : smartListings;
    // Filter out swiped items using ref (doesn't trigger re-renders)
    return baseListings.filter(l => !swipedIdsRef.current.has(l.id));
  }, [allListings, smartListings]);

  const isLoading = smartLoading;
  const error = smartError;
  const isRefetching = smartRefetching;

  // Debounced refetch to prevent rapid-fire calls
  const refetchCore = useCallback(() => {
    setCurrentIndex(0);
    setPage(0);
    setAllListings([]);
    refetchSmart();
  }, [refetchSmart]);

  const refetch = useDebounce(refetchCore, 300);
  
  const swipeMutation = useSwipe();
  const { canAccess: hasPremiumMessaging, needsUpgrade } = useCanAccessMessaging();
  const navigate = useNavigate();
  const { recordSwipe, undoLastSwipe, canUndo, isUndoing } = useSwipeUndo();
  const startConversation = useStartConversation();
  const recordProfileView = useRecordProfileView();

  // Prefetch images for next 2 listings (massively improves perceived performance)
  usePrefetchImages({
    currentIndex,
    profiles: allListings,
    prefetchCount: 2
  });

  // Add newly fetched listings to the stack - with guard to prevent unnecessary updates
  // FIX: Cap at 50 listings to prevent memory bloat and expensive filtering
  useEffect(() => {
    if (smartListings.length > 0 && !isLoading) {
      setAllListings(prev => {
        const existingIds = new Set(prev.map(l => l.id));
        const newListings = smartListings.filter(l => !existingIds.has(l.id));
        if (newListings.length > 0) {
          const combined = [...prev, ...newListings];
          // Cap at 50 listings - remove oldest ones first
          return combined.length > 50 ? combined.slice(-50) : combined;
        }
        return prev; // Don't update if no new listings
      });
      isFetchingMore.current = false; // Reset fetch guard
    }
  }, [smartListings, isLoading]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentListing = listings[currentIndex];
    if (!currentListing) return;

    setSwipeDirection(direction);
    triggerHaptic(direction === 'right' ? 'success' : 'warning');

    // FIX: Use ref instead of state to avoid re-render cascade
    swipedIdsRef.current.add(currentListing.id);

    swipeMutation.mutate({
      targetId: currentListing.id,
      direction,
      targetType: 'listing'
    });

    recordSwipe(currentListing.id, 'listing', direction === 'right' ? 'like' : 'pass');
    recordProfileView.mutate({
      profileId: currentListing.id,
      viewType: 'listing',
      action: direction === 'right' ? 'like' : 'pass'
    });

    // Instant update - no delay for real-time feel
    setCurrentIndex(prev => prev + 1);
    setSwipeDirection(null);
  }, [currentIndex, listings, swipeMutation, recordSwipe, recordProfileView]);

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsRefreshMode(true); // Enable refresh mode to show disliked listings within cooldown
    triggerHaptic('medium');

    // Reset state for refresh
    // NOTE: isRefreshMode = true will:
    // - Show disliked listings still within 3-day cooldown (random order)
    // - NEVER show liked listings (they stay saved forever)
    // - NEVER show listings past 3-day cooldown (permanently hidden)
    setCurrentIndex(0);
    swipedIdsRef.current.clear(); // FIX: Clear ref instead of state
    setAllListings([]);
    setPage(0);

    try {
      await refetch();
      toast({
        title: 'Properties Refreshed',
        description: 'Showing properties you passed on. Liked ones stay saved!',
      });
    } catch (error) {
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
    const currentListing = listings[currentIndex];

    // Navigation guard - prevent double-tap
    if (!canNavigate()) {
      return;
    }

    if (!currentListing?.owner_id || isCreatingConversation) {
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
        otherUserId: currentListing.owner_id,
        listingId: currentListing.id,
        initialMessage: `Hi! I'm interested in your property: ${currentListing.title}`,
        canStartNewConversation: true,
      });

      if (result?.conversationId) {
        toast({
          title: 'Conversation created!',
          description: 'Opening chat...'
        });

        // Navigate immediately - the mutation already completed successfully
        // No need for setTimeout hack since we awaited the mutation
        navigate(`/messages?conversationId=${result.conversationId}`);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[TinderentSwipe] Error starting conversation:', error);
      }
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not start conversation',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingConversation(false);
      endNavigation();
    }
  };

  const progress = listings.length > 0 ? ((currentIndex + 1) / listings.length) * 100 : 0;

  // Only show loading on initial load, not during background refetch
  // Use skeleton screen instead of spinner for professional feel
  if (isLoading && listings.length === 0) {
    return (
      <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex flex-col px-3">
        {/* Skeleton Card - Matches TinderSwipeCard layout */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-0 rounded-3xl overflow-hidden bg-muted/30 animate-pulse">
            {/* Image skeleton with gradient shimmer */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
                   style={{ animationDuration: '1.5s', backgroundSize: '200% 100%' }} />
            </div>

            {/* Story dots skeleton */}
            <div className="absolute top-3 left-0 right-0 z-30 flex justify-center gap-1 px-4">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="flex-1 h-1 rounded-full bg-white/20" />
              ))}
            </div>

            {/* Bottom sheet skeleton */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl rounded-t-[24px] p-4 pt-6">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-1.5 bg-white/30 rounded-full" />
              </div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-white/20" />
                  <Skeleton className="h-4 w-1/2 bg-white/15" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-6 w-20 bg-white/20" />
                  <Skeleton className="h-3 w-12 bg-white/15 ml-auto" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-4 w-12 bg-white/15" />
                <Skeleton className="h-4 w-12 bg-white/15" />
                <Skeleton className="h-4 w-16 bg-white/15" />
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex-shrink-0 flex justify-center items-center py-3 px-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-14 h-14 rounded-full bg-muted/40" />
            <Skeleton className="w-11 h-11 rounded-full bg-muted/30" />
            <Skeleton className="w-11 h-11 rounded-full bg-muted/30" />
            <Skeleton className="w-14 h-14 rounded-full bg-muted/40" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex items-center justify-center">
        <Card className="text-center bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20 p-8">
          <div className="text-6xl mb-4">😞</div>
          <h3 className="text-xl font-bold mb-2">Oops! Something went wrong</h3>
          <p className="text-muted-foreground mb-4">We couldn't load properties right now.</p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center space-y-6 p-8"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <Home className="w-12 h-12 text-primary" />
            </div>
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">No Properties Found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Try adjusting your filters or refresh to discover new listings
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2 rounded-full px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Loading...' : 'Refresh Properties'}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentIndex >= listings.length) {
    return (
      <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center space-y-6 p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Search className="w-12 h-12 text-green-500" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h3 className="text-xl font-semibold text-foreground">All Caught Up!</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              You've seen all available properties. Check back later or refresh for new listings.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-3"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2 rounded-full px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg text-base"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Finding Properties...' : 'Discover More'}
              </Button>
            </motion.div>

            <p className="text-xs text-muted-foreground">
              New properties are added daily
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const currentListing = listings[currentIndex];

  return (
    <div className="relative w-full h-full flex-1 flex flex-col max-w-lg mx-auto px-3">
      {/* Card Container - Full height, no clipping */}
      <div className="relative flex-1 w-full">
        <AnimatePresence mode="popLayout">
          {/* Current card on top */}
          {currentListing && (
            <motion.div
              key={currentListing.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                x: swipeDirection === 'right' ? 400 : swipeDirection === 'left' ? -400 : 0,
                opacity: 0,
                rotate: swipeDirection === 'right' ? 15 : swipeDirection === 'left' ? -15 : 0,
                scale: 0.85,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                  mass: 0.5
                }
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
                mass: 0.5
              }}
              className="w-full h-full absolute inset-0"
              style={{ willChange: 'transform, opacity' }}
            >
              <TinderSwipeCard
                listing={currentListing}
                onSwipe={handleSwipe}
                onTap={() => onListingTap(currentListing.id)}
                onUndo={canUndo ? () => undoLastSwipe() : undefined}
                onInsights={handleInsights}
                onShare={handleShare}
                hasPremium={true}
                isTop={true}
                hideActions={insightsModalOpen}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Insights Modal */}
      <SwipeInsightsModal
        open={insightsModalOpen}
        onOpenChange={setInsightsModalOpen}
        listing={currentListing}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        listingId={currentListing?.id}
        title={currentListing?.title || 'Check out this listing'}
        description={currentListing?.description}
      />
    </div>
  );
};

export const TinderentSwipeContainer = memo(TinderentSwipeContainerComponent);