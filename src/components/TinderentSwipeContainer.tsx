import { useState, useCallback, useEffect, memo, useMemo, useRef } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { TinderSwipeCard } from './TinderSwipeCard';
import { SwipeInsightsModal } from './SwipeInsightsModal';
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
import { RotateCcw, Sparkles, RefreshCw, Home, Search, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set()); // Track swiped listings
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch guards to prevent infinite loops
  const isFetchingMore = useRef(false);
  const lastFetchedPage = useRef(-1);

  // Get listings with filters applied and pagination
  const {
    data: smartListings = [],
    isLoading: smartLoading,
    error: smartError,
    isRefetching: smartRefetching,
    refetch: refetchSmart
  } = useSmartListingMatching([], filters, page, 10);
  
  const { 
    data: regularListings = [], 
    isLoading: regularLoading,
    refetch: refetchRegular
  } = useListings([]);

  // Use accumulated listings - memoized with length checks and filter out swiped items
  const listings = useMemo(() => {
    let baseListings = allListings.length > 0 ? allListings :
                       smartListings.length > 0 ? smartListings : regularListings;
    // Filter out any listings that have been swiped in this session
    if (swipedIds.size > 0) {
      baseListings = baseListings.filter(l => !swipedIds.has(l.id));
    }
    return baseListings;
  }, [allListings, smartListings, regularListings, swipedIds]);
  
  const isLoading = smartLoading || regularLoading;
  const error = smartError;
  const isRefetching = smartRefetching;
  
  const refetch = useCallback(() => {
    setCurrentIndex(0);
    setPage(0);
    setAllListings([]);
    refetchSmart();
    refetchRegular();
  }, [refetchSmart, refetchRegular]);
  
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
  useEffect(() => {
    if (smartListings.length > 0 && !isLoading) {
      setAllListings(prev => {
        const existingIds = new Set(prev.map(l => l.id));
        const newListings = smartListings.filter(l => !existingIds.has(l.id));
        if (newListings.length > 0) {
          return [...prev, ...newListings];
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

    // Immediately add to swiped IDs to prevent re-showing
    setSwipedIds(prev => new Set(prev).add(currentListing.id));

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

    // Small delay for animation smoothness, then update index
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 50);
  }, [currentIndex, listings, swipeMutation, recordSwipe, recordProfileView]);

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerHaptic('medium');

    // Reset all state for fresh start
    setCurrentIndex(0);
    setSwipedIds(new Set()); // Clear swiped IDs to show fresh listings
    setAllListings([]);
    setPage(0);

    try {
      await refetch();
      toast({
        title: 'Fresh Properties Loaded',
        description: 'Swipe to find your perfect match!',
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

  const handleMessage = async () => {
    const currentListing = listings[currentIndex];
    
    if (!currentListing?.owner_id || isCreatingConversation) {
      toast({
        title: 'Cannot Start Conversation',
        description: 'Owner information not available.',
      });
      return;
    }

    if (needsUpgrade) {
      navigate('/client/settings#subscription');
      toast({
        title: 'Subscription Required',
        description: 'Upgrade to message property owners.',
      });
      return;
    }

    if (!hasPremiumMessaging) {
      navigate('/client/settings#subscription');
      return;
    }

    setIsCreatingConversation(true);
    
    try {
      toast({
        title: '⏳ Creating conversation...',
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
          title: '✅ Conversation created!',
          description: 'Opening chat...'
        });
        
        // Wait 500ms before navigating to ensure DB is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        navigate(`/messages?conversationId=${result.conversationId}`);
      }
    } catch (error) {
      console.error('[TinderentSwipe] Error starting conversation:', error);
      toast({
        title: '❌ Error',
        description: error instanceof Error ? error.message : 'Could not start conversation',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const progress = listings.length > 0 ? ((currentIndex + 1) / listings.length) * 100 : 0;

  // Only show skeleton on initial load, not during background refetch
  if (isLoading && listings.length === 0) {
    return (
      <div className="relative w-full h-[550px] max-w-sm mx-auto">
        <Card className="w-full h-[450px] bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50">
          <div className="p-6 space-y-4">
            <Skeleton className="w-full h-64 rounded-lg" />
            <Skeleton className="w-3/4 h-6" />
            <Skeleton className="w-1/2 h-4" />
            <div className="flex space-x-2">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
          </div>
        </Card>
        <div className="text-center mt-4 text-muted-foreground">
          <Sparkles className="w-5 h-5 mx-auto mb-2 animate-spin" />
          Finding perfect properties...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[550px] max-w-sm mx-auto flex items-center justify-center">
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
      <div className="relative w-full h-[calc(100vh-200px)] max-w-lg mx-auto flex items-center justify-center px-4">
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
      <div className="relative w-full h-[calc(100vh-200px)] max-w-lg mx-auto flex items-center justify-center px-4">
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
  const nextListing = listings[currentIndex + 1];

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* FLOATING REFRESH BUTTON - Bottom center, always visible */}
      <motion.div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50"
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          size="lg"
          className="rounded-full w-14 h-14 bg-gradient-to-br from-primary to-orange-500 shadow-2xl border-2 border-white/20"
        >
          <RefreshCw className={`w-6 h-6 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </motion.div>

      {/* Card Container - Full screen */}
      <div className="relative flex-1 w-full overflow-hidden">
        <AnimatePresence mode="sync" initial={false}>
          {/* Next card behind */}
          {nextListing && (
            <motion.div
              key={`next-${nextListing.id}`}
              initial={{ scale: 0.95, y: 8, opacity: 0.8 }}
              animate={{ scale: 0.95, y: 8, opacity: 0.8 }}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <TinderSwipeCard
                listing={nextListing}
                onSwipe={() => {}}
                isTop={false}
              />
            </motion.div>
          )}

          {/* Current card */}
          {currentListing && (
            <motion.div
              key={currentListing.id}
              initial={{ scale: 1, y: 0, opacity: 1 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{
                x: swipeDirection === 'right' ? 600 : swipeDirection === 'left' ? -600 : 0,
                opacity: 0,
                rotate: swipeDirection === 'right' ? 30 : swipeDirection === 'left' ? -30 : 0,
                scale: 0.85,
                transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.3 }
              }}
              className="absolute inset-0"
              style={{ zIndex: 1 }}
            >
              <TinderSwipeCard
                listing={currentListing}
                onSwipe={handleSwipe}
                onTap={() => onListingTap(currentListing.id)}
                onUndo={canUndo ? () => undoLastSwipe() : undefined}
                onInsights={handleInsights}
                hasPremium={true}
                isTop={true}
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
    </div>
  );
};

export const TinderentSwipeContainer = memo(TinderentSwipeContainerComponent);