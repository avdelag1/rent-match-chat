import { useState, useCallback, useEffect, memo, useMemo, useRef } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { TinderSwipeCard } from './TinderSwipeCard';
import { SwipeActionButtons } from './SwipeActionButtons';
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
import { RotateCcw, Sparkles, RefreshCw } from 'lucide-react';
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

  // Use accumulated listings - memoized with length checks to prevent unnecessary recalculations
  const listings = useMemo(() => {
    if (allListings.length > 0) return allListings;
    if (smartListings.length > 0) return smartListings;
    return regularListings;
  }, [allListings.length, smartListings.length, regularListings.length]);
  
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

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  }, [currentIndex, listings, swipeMutation, recordSwipe, recordProfileView]);

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  const handleRefresh = async () => {
    setCurrentIndex(0);
    await refetch();
    toast({
      title: 'Properties Updated',
      description: 'All listings reloaded.',
    });
  };


  const handleInsights = () => {
    setInsightsModalOpen(true);
    triggerHaptic('light');
  };

  const handleMessage = async () => {
    const currentListing = listings[currentIndex];
    console.log('[TinderentSwipe] Message button clicked for listing:', currentListing?.id);
    
    if (!currentListing?.owner_id || isCreatingConversation) {
      console.log('[TinderentSwipe] Cannot start conversation - no owner or already creating');
      toast({
        title: 'Cannot Start Conversation',
        description: 'Owner information not available.',
      });
      return;
    }

    if (needsUpgrade) {
      console.log('[TinderentSwipe] User needs upgrade for messaging');
      navigate('/client/settings#subscription');
      toast({
        title: 'Subscription Required',
        description: 'Upgrade to message property owners.',
      });
      return;
    }

    if (!hasPremiumMessaging) {
      console.log('[TinderentSwipe] User does not have premium messaging');
      navigate('/client/settings#subscription');
      return;
    }

    setIsCreatingConversation(true);
    console.log('[TinderentSwipe] Creating conversation with owner:', currentListing.owner_id);
    
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

      console.log('[TinderentSwipe] Conversation created:', result);

      if (result?.conversationId) {
        toast({
          title: '✅ Conversation created!',
          description: 'Opening chat...'
        });
        
        // Wait 500ms before navigating to ensure DB is updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('[TinderentSwipe] Navigating to conversation:', result.conversationId);
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
      <div className="relative w-full h-[550px] max-w-sm mx-auto flex items-center justify-center">
        <Card className="text-center bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 p-8">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-bold mb-2">No Properties Found</h3>
          <p className="text-muted-foreground mb-4">
            Check back later or refresh for new properties.
          </p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="gap-2 w-full"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </Button>
        </Card>
      </div>
    );
  }

  if (currentIndex >= listings.length) {
    return (
      <div className="relative w-full h-[550px] max-w-sm mx-auto flex items-center justify-center">
        <Card className="text-center bg-gradient-to-br from-success/10 to-success/5 border-success/20 p-8">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2">You've seen them all!</h3>
          <p className="text-muted-foreground mb-4">
            Check back later for new properties.
          </p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="gap-2 w-full"
          >
            <RotateCcw className="w-4 h-4" />
            Check for New Listings
          </Button>
        </Card>
      </div>
    );
  }

  const currentListing = listings[currentIndex];
  const nextListing = listings[currentIndex + 1];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start">
      {/* Refresh Button - Top Right - Only show when all cards swiped */}
      {currentIndex >= listings.length && (
        <div className="absolute top-2 right-2 z-50">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg bg-background/95 backdrop-blur-sm"
            disabled={isRefetching}
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}

      {/* Card Container - Full screen swipe experience */}
      <div className="relative w-full h-full max-w-lg mx-auto overflow-visible">
        <AnimatePresence mode="sync" initial={false}>
          {/* Show next card behind current card for stack effect */}
          {nextListing && (
            <motion.div
              key={`next-${nextListing.id}`}
              initial={{ scale: 0.95, y: 8, opacity: 0.8 }}
              animate={{ scale: 0.95, y: 8, opacity: 0.8 }}
              className="w-full h-full absolute inset-0 pointer-events-none"
              style={{ zIndex: 0 }}
            >
              <TinderSwipeCard
                listing={nextListing}
                onSwipe={() => {}}
                isTop={false}
              />
            </motion.div>
          )}

          {/* Current card on top */}
          {currentListing && (
            <motion.div
              key={currentListing.id}
              initial={{ scale: 1, y: 0, opacity: 1 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{
                x: swipeDirection === 'right' ? 600 : swipeDirection === 'left' ? -600 : 0,
                y: 0,
                opacity: 0,
                rotate: swipeDirection === 'right' ? 30 : swipeDirection === 'left' ? -30 : 0,
                scale: 0.85,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  mass: 0.8,
                  duration: 0.3
                }
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 1
              }}
              className="w-full h-full absolute inset-0"
              style={{ willChange: 'transform, opacity', zIndex: 1 }}
            >
              <TinderSwipeCard
                listing={currentListing}
                onSwipe={handleSwipe}
                onTap={() => onListingTap(currentListing.id)}
                isTop={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons - Overlay at Bottom of Card */}
      <div className="pointer-events-none absolute inset-x-0 bottom-20 z-40 flex justify-center">
        <div className="w-full max-w-md px-4">
          <SwipeActionButtons
            onUndo={() => undoLastSwipe()}
            onPass={() => handleButtonSwipe('left')}
            onInfo={handleInsights}
            onLike={() => handleButtonSwipe('right')}
            canUndo={canUndo}
            disabled={swipeMutation.isPending || isCreatingConversation || !currentListing}
          />
        </div>
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