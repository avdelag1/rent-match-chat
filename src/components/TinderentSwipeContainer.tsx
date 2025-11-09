import { useState, useCallback } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { EnhancedPropertyCard } from './EnhancedPropertyCard';
import { useListings, useSwipedListings } from '@/hooks/useListings';
import { useSmartListingMatching, ListingFilters } from '@/hooks/useSmartMatching';
import { useSwipe } from '@/hooks/useSwipe';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { useStartConversation } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flame, X, RotateCcw, Sparkles, MessageCircle, Eye } from 'lucide-react';
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

export function TinderentSwipeContainer({ onListingTap, onInsights, onMessageClick, locationFilter, filters }: TinderentSwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Get listings with filters applied
  const {
    data: smartListings = [],
    isLoading: smartLoading,
    error: smartError,
    isRefetching: smartRefetching,
    refetch: refetchSmart
  } = useSmartListingMatching([], filters);
  
  const { 
    data: regularListings = [], 
    isLoading: regularLoading,
    refetch: refetchRegular
  } = useListings([]);

  // Use smart listings if available, otherwise fallback to regular
  const listings = smartListings.length > 0 ? smartListings : regularListings;
  const isLoading = smartLoading || regularLoading;
  const error = smartError;
  const isRefetching = smartRefetching;
  const refetch = useCallback(() => {
    setCurrentIndex(0); // Reset to first listing on refresh
    refetchSmart();
    refetchRegular();
  }, [refetchSmart, refetchRegular]);
  
  const swipeMutation = useSwipe();
  const { canAccess: hasPremiumMessaging, needsUpgrade } = useCanAccessMessaging();
  const navigate = useNavigate();
  const { recordSwipe, undoLastSwipe, canUndo, isUndoing } = useSwipeUndo();
  const startConversation = useStartConversation();

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentListing = listings[currentIndex];
    if (!currentListing) {
      console.log('No current listing found for swipe');
      return;
    }

    console.log('Starting swipe:', { 
      listingId: currentListing.id, 
      direction, 
      currentIndex,
      listingTitle: currentListing.title 
    });

    setSwipeDirection(direction);
    
    // Trigger haptic feedback
    triggerHaptic(direction === 'right' ? 'success' : 'light');
    
    // Record swipe
    swipeMutation.mutate({
      targetId: currentListing.id,
      direction,
      targetType: 'listing'
    });

    // Record the swipe for undo functionality
    recordSwipe(currentListing.id, 'listing', direction === 'right' ? 'like' : 'pass');

    // Move to next card after animation with proper delay for smooth rhythm
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300); // 300ms delay for smooth visual rhythm
  }, [currentIndex, listings, swipeMutation, recordSwipe]);

  const handleSuperLike = useCallback(async (targetId: string, targetType: string) => {
    swipeMutation.mutate({
      targetId,
      direction: 'right',
      targetType: targetType as 'listing' | 'profile'
    });
    
    toast({
      title: "Super Liked! ⭐",
      description: "This property will know you're really interested!",
      duration: 3000,
    });
    
    setCurrentIndex(prev => prev + 1);
  }, [swipeMutation]);

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


  const handleInsights = (listingId: string) => {
    if (onInsights) {
      onInsights(listingId);
    } else {
      toast({
        title: '🔍 Property Deep Dive',
        description: 'Opening detailed insights...',
      });
    }
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

  if (isLoading || isRefetching) {
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

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Single Card Container - No infinite scrolling */}
      <div className="relative w-[95vw] sm:w-[90vw] md:max-w-xl mx-auto mb-20 h-[75vh] sm:h-[65vh] md:h-[600px] max-h-[750px]">
        <AnimatePresence mode="wait">
          {currentListing && (
            <motion.div
              key={currentListing.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              exit={{
                x: swipeDirection === 'right' ? 600 : swipeDirection === 'left' ? -600 : 0,
                opacity: 0,
                rotate: swipeDirection === 'right' ? 10 : swipeDirection === 'left' ? -10 : 0,
                scale: 0.85,
                transition: {
                  type: "spring",
                  stiffness: 180,
                  damping: 15,
                  mass: 0.5,
                  duration: 0.3
                }
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.7
              }}
              className="w-full h-full"
              style={{
                willChange: 'transform, opacity'
              }}
            >
              <EnhancedPropertyCard
                listing={currentListing}
                onSwipe={handleSwipe}
                onTap={() => onListingTap(currentListing.id)}
                onSuperLike={() => handleSuperLike(currentListing.id, 'listing')}
                onMessage={handleMessage}
                isTop={true}
                hasPremium={hasPremiumMessaging}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* Bottom Action Bar - 3 Buttons - Floating with NO background */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)'
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-center items-center gap-6 py-4 px-4 pointer-events-none">
          {/* Dislike Button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              size="lg"
              variant="ghost"
              className="pointer-events-auto w-16 h-16 rounded-full bg-white border-4 border-rose-500 text-rose-500 hover:bg-gradient-to-br hover:from-rose-500 hover:to-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300 shadow-[0_8px_16px_rgba(239,68,68,0.3)] hover:shadow-[0_12px_24px_rgba(239,68,68,0.4)] p-0"
              onClick={() => handleButtonSwipe('left')}
              disabled={swipeMutation.isPending || isCreatingConversation || !currentListing}
              aria-label="Dislike this property"
            >
              <X className="w-8 h-8 stroke-[2.5]" />
            </Button>
          </motion.div>

          {/* Return/Undo Button */}
          <motion.div
            whileHover={{ scale: canUndo ? 1.1 : 1 }}
            whileTap={{ scale: canUndo ? 0.9 : 1 }}
          >
            <Button
              size="lg"
              variant="ghost"
              onClick={() => {
                if (canUndo) {
                  undoLastSwipe();
                }
              }}
              disabled={!canUndo || isUndoing || isCreatingConversation}
              className={`pointer-events-auto w-14 h-14 rounded-full transition-all duration-300 shadow-[0_8px_16px_rgba(107,114,128,0.3)] p-0 ${
                canUndo 
                  ? 'bg-white border-4 border-gray-400 text-gray-600 hover:bg-gray-50 hover:shadow-[0_12px_24px_rgba(107,114,128,0.4)]' 
                  : 'bg-gray-200 border-4 border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
              }`}
              aria-label="Undo last swipe"
            >
              <motion.div
                animate={{ rotate: isUndoing ? 360 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <RotateCcw className="w-6 h-6 stroke-[2.5]" />
              </motion.div>
            </Button>
          </motion.div>

          {/* Like Button */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              size="lg"
              variant="ghost"
              className="pointer-events-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white transition-all duration-300 shadow-[0_8px_16px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_24px_rgba(16,185,129,0.5)] border-0 p-0"
              onClick={() => handleButtonSwipe('right')}
              disabled={swipeMutation.isPending || isCreatingConversation || !currentListing}
              aria-label="Like this property"
            >
              <Flame className="w-8 h-8 fill-white stroke-white" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}