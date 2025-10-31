import { useState, useCallback } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { EnhancedPropertyCard } from './EnhancedPropertyCard';
import { useListings, useSwipedListings } from '@/hooks/useListings';
import { useSmartListingMatching, ListingFilters } from '@/hooks/useSmartMatching';
import { useSwipe } from '@/hooks/useSwipe';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flame, X, RotateCcw, Sparkles } from 'lucide-react';
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
  const [emojiAnimation, setEmojiAnimation] = useState<{
    show: boolean;
    type: 'like' | 'dislike';
    position: 'left' | 'right';
  }>({ show: false, type: 'like', position: 'right' });
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);
  const [verticalDragOffset, setVerticalDragOffset] = useState(0);

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
    
    // Show emoji immediately for better UX
    setEmojiAnimation({ 
      show: true, 
      type: direction === 'right' ? 'like' : 'dislike',
      position: direction === 'right' ? 'right' : 'left'
    });
    
    setTimeout(() => {
      setEmojiAnimation({ show: false, type: 'like', position: 'right' });
    }, 400);
    
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

  const handleVerticalDrag = (event: any, info: any) => {
    setIsDraggingVertical(true);
    setVerticalDragOffset(info.offset.y);
  };

  const handleVerticalDragEnd = (event: any, info: any) => {
    setIsDraggingVertical(false);
    setVerticalDragOffset(0);

    const threshold = 100; // pixels to trigger swipe
    const velocity = Math.abs(info.velocity.y);
    const offset = info.offset.y;

    // Swipe UP (negative offset) = Next card
    if (offset < -threshold || (velocity > 500 && offset < -50)) {
      if (currentIndex < listings.length - 1) {
        setCurrentIndex(prev => prev + 1);
        triggerHaptic('light');
      }
    }
    // Swipe DOWN (positive offset) = Previous card
    else if (offset > threshold || (velocity > 500 && offset > 50)) {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        triggerHaptic('light');
      }
    }
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

  const handleMessage = () => {
    if (needsUpgrade) {
      // Route users to Settings > Subscription instead of showing inline upgrade UI
      navigate('/client/settings#subscription');
      toast({
        title: 'Subscription Required',
        description: 'Manage or upgrade your plan in Settings > Subscription.',
      });
      return;
    }

    if (hasPremiumMessaging) {
      navigate('/messages');
    } else {
      toast({
        title: 'Subscription Required',
        description: 'Manage or upgrade your plan in Settings > Subscription.',
      });
    }
  };

  const progress = listings.length > 0 ? ((currentIndex + 1) / listings.length) * 100 : 0;

  if (isLoading || isRefetching) {
    return (
      <div className="relative w-full h-[700px] max-w-sm mx-auto">
        <Card className="w-full h-[600px] bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50">
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
      <div className="relative w-full h-[700px] max-w-sm mx-auto flex items-center justify-center">
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
      <div className="relative w-full h-[700px] max-w-sm mx-auto flex items-center justify-center">
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
      <div className="relative w-full h-[700px] max-w-sm mx-auto flex items-center justify-center">
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
  const thirdListing = listings[currentIndex + 2];

  // Calculate card positions based on vertical drag
  const getCardStyle = (index: number) => {
    const relativeIndex = index - currentIndex;

    // Base positions for stacked cards
    const baseScale = 1 - (relativeIndex * 0.05);
    const baseY = relativeIndex * 20;
    const baseOpacity = Math.max(0.3, 1 - (relativeIndex * 0.3));

    // Apply drag offset to current card
    if (relativeIndex === 0 && isDraggingVertical) {
      return {
        scale: 1,
        y: verticalDragOffset,
        opacity: Math.max(0.5, 1 - Math.abs(verticalDragOffset) / 400),
        zIndex: 20
      };
    }

    // Next card moves up when current is dragged up
    if (relativeIndex === 1 && isDraggingVertical && verticalDragOffset < 0) {
      const progress = Math.min(1, Math.abs(verticalDragOffset) / 200);
      return {
        scale: baseScale + (progress * 0.05),
        y: baseY - (progress * 20),
        opacity: baseOpacity + (progress * 0.3),
        zIndex: 10 + relativeIndex
      };
    }

    // Previous card moves down when current is dragged down
    if (relativeIndex === -1 && isDraggingVertical && verticalDragOffset > 0) {
      const progress = Math.min(1, verticalDragOffset / 200);
      return {
        scale: 1 - (progress * 0.05),
        y: -(progress * 20),
        opacity: Math.max(0.5, 1 - (progress * 0.3)),
        zIndex: 30
      };
    }

    return {
      scale: baseScale,
      y: baseY,
      opacity: baseOpacity,
      zIndex: 10 + relativeIndex
    };
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Emoji Animation Overlay - Fixed positioning for maximum visibility */}
      <AnimatePresence>
        {emojiAnimation.show && (
          <motion.div
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{
                scale: 0,
                opacity: 0,
                x: emojiAnimation.position === 'right' ? 80 : -80,
                rotate: emojiAnimation.position === 'right' ? 15 : -15
              }}
              animate={{
                scale: 2.5,
                opacity: 1,
                x: emojiAnimation.position === 'right' ? 40 : -40,
                rotate: 0
              }}
              exit={{
                scale: emojiAnimation.type === 'like' ? 3.5 : 1.5,
                opacity: 0,
                y: emojiAnimation.type === 'like' ? -250 : -100,
                x: emojiAnimation.type === 'like' ? 0 : (emojiAnimation.position === 'left' ? -300 : 300),
                rotate: emojiAnimation.type === 'like' ? 0 : (emojiAnimation.position === 'left' ? -75 : 75)
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.5
              }}
              style={{ willChange: 'transform, opacity' }}
              className={`absolute ${
                emojiAnimation.position === 'right' ? 'right-8' : 'left-8'
              } top-1/3`}
            >
              <div className="relative">
                {/* Glow effect */}
                <div className={`absolute inset-0 blur-3xl opacity-50 ${
                  emojiAnimation.type === 'like'
                    ? 'bg-gradient-to-r from-orange-400 to-red-500'
                    : 'bg-gradient-to-r from-gray-400 to-blue-300'
                }`} />
                {/* Emoji */}
                <div className="relative text-[100px] drop-shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
                  {emojiAnimation.type === 'like' ? '🔥' : '💨'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Cards Container - Instagram Style Stacking */}
      <motion.div
        className="relative w-[95vw] sm:w-[90vw] md:max-w-xl mx-auto mb-20"
        style={{ minHeight: 'min(85vh, 750px)' }}
        drag="y"
        dragConstraints={{ top: -300, bottom: 300 }}
        dragElastic={0.2}
        onDrag={handleVerticalDrag}
        onDragEnd={handleVerticalDragEnd}
      >
        <AnimatePresence mode="popLayout">
          {/* Third card (behind next) */}
          {thirdListing && (
            <motion.div
              key={`third-${thirdListing.id}`}
              initial={{ scale: 0.85, y: 40, opacity: 0.3 }}
              animate={{ scale: 0.85, y: 40, opacity: 0.3 }}
              className="absolute inset-0 shadow-lg pointer-events-none"
              style={{ willChange: 'transform, opacity', zIndex: 1 }}
            >
              <EnhancedPropertyCard
                listing={thirdListing}
                onSwipe={() => {}}
                onTap={() => {}}
                onSuperLike={() => {}}
                onMessage={() => {}}
                isTop={false}
                hasPremium={hasPremiumMessaging}
              />
            </motion.div>
          )}

          {/* Next card - becomes current when swiping */}
          {nextListing && (
            <motion.div
              key={`next-${nextListing.id}`}
              initial={{ scale: 0.90, y: 20, opacity: 0.5 }}
              animate={getCardStyle(currentIndex + 1)}
              className="absolute inset-0 shadow-xl pointer-events-none"
              style={{ willChange: 'transform, opacity' }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
              }}
            >
              <EnhancedPropertyCard
                listing={nextListing}
                onSwipe={() => {}}
                onTap={() => {}}
                onSuperLike={() => {}}
                onMessage={() => {}}
                isTop={false}
                hasPremium={hasPremiumMessaging}
              />
            </motion.div>
          )}

          {/* Previous card - appears when swiping down */}
          {currentIndex > 0 && listings[currentIndex - 1] && (
            <motion.div
              key={`prev-${listings[currentIndex - 1].id}`}
              initial={{ scale: 1, y: 0, opacity: 0 }}
              animate={getCardStyle(currentIndex - 1)}
              className="absolute inset-0 shadow-2xl pointer-events-none"
              style={{ willChange: 'transform, opacity' }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
              }}
            >
              <EnhancedPropertyCard
                listing={listings[currentIndex - 1]}
                onSwipe={() => {}}
                onTap={() => {}}
                onSuperLike={() => {}}
                onMessage={() => {}}
                isTop={false}
                hasPremium={hasPremiumMessaging}
              />
            </motion.div>
          )}

          {/* Current card - Main interactive card */}
          {currentListing && (
            <motion.div
              key={currentListing.id}
              initial={{ scale: 0.95, opacity: 0.7, y: 10 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                ...getCardStyle(currentIndex)
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
                mass: 0.8
              }}
              className="absolute inset-0 shadow-2xl"
              style={{
                willChange: 'transform, opacity',
                filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))'
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
      </motion.div>


      {/* Bottom Action Buttons - 3 Button Layout - Always visible at bottom */}
      <motion.div
        className="flex justify-center gap-6 items-center z-20 px-4 mt-4"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Dislike Button - Left */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="lg"
            variant="ghost"
            className="w-16 h-16 rounded-full bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 transition-all duration-300 shadow-xl hover:shadow-red-500/20 p-0"
            onClick={() => handleButtonSwipe('left')}
            disabled={swipeMutation.isPending}
            aria-label="Pass on this property"
          >
            <X className="w-8 h-8 stroke-[2.5]" />
          </Button>
        </motion.div>

        {/* Undo Button - Center */}
        <motion.div
          whileHover={{ scale: canUndo ? 1.1 : 1 }}
          whileTap={{ scale: canUndo ? 0.9 : 1 }}
        >
          <Button
            size="lg"
            variant="ghost"
            onClick={() => canUndo && undoLastSwipe()}
            disabled={!canUndo || isUndoing}
            className={`w-16 h-16 rounded-full transition-all duration-300 shadow-lg p-0 ${
              canUndo 
                ? 'bg-white border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:shadow-xl hover:shadow-yellow-500/20' 
                : 'bg-gray-200 border-2 border-gray-400 text-gray-500 cursor-not-allowed opacity-60'
            }`}
            aria-label="Undo last swipe"
          >
            <motion.div
              animate={{ rotate: isUndoing ? 360 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <RotateCcw className="w-7 h-7 stroke-[2.5]" />
            </motion.div>
          </Button>
        </motion.div>
        
        {/* Like Button - Right */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="lg"
            variant="ghost"
            className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white transition-all duration-300 shadow-xl hover:shadow-orange-500/30 p-0 border-0"
            onClick={() => handleButtonSwipe('right')}
            disabled={swipeMutation.isPending}
            aria-label="Like this property"
          >
            <Flame className="w-11 h-11 fill-white stroke-white" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}