import { useState, useCallback } from 'react';
import { EnhancedPropertyCard } from './EnhancedPropertyCard';
import { useListings, useSwipedListings } from '@/hooks/useListings';
import { useSmartListingMatching } from '@/hooks/useSmartMatching';
import { useSwipe } from '@/hooks/useSwipe';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flame, X, RotateCcw, Home, Sparkles, Crown, ThumbsUp, ThumbsDown } from 'lucide-react';
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
}

export function TinderentSwipeContainer({ onListingTap, onInsights, onMessageClick, locationFilter }: TinderentSwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [emojiAnimation, setEmojiAnimation] = useState<{
    show: boolean;
    type: 'like' | 'dislike';
    position: 'left' | 'right';
  }>({ show: false, type: 'like', position: 'right' });
  
  const { data: swipedIds = [] } = useSwipedListings();
  const { data: listings = [], isLoading, refetch, isRefetching, error } = useSmartListingMatching(swipedIds);
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
    
    // Show emoji immediately for better UX
    setEmojiAnimation({ 
      show: true, 
      type: direction === 'right' ? 'like' : 'dislike',
      position: direction === 'right' ? 'right' : 'left'
    });
    
    setTimeout(() => {
      setEmojiAnimation({ show: false, type: 'like', position: 'right' });
    }, 1200);
    
    // Record swipe
    swipeMutation.mutate({
      targetId: currentListing.id,
      direction,
      targetType: 'listing'
    });

    // Record the swipe for undo functionality
    recordSwipe(currentListing.id, 'listing', direction === 'right' ? 'like' : 'pass');

    // Move to next card after animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
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
      description: 'Latest listings loaded.',
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

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setCurrentIndex(0);
    refetch(); // Force refetch with new filters
    
    const activeFiltersCount = Object.values(filters).flat().filter(Boolean).length;
    toast({
      title: '✨ Filters Applied',
      description: `Found properties matching your ${activeFiltersCount} preferences.`,
    });
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

  return (
    <div className="w-full h-full flex flex-col">
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
                x: emojiAnimation.position === 'right' ? 150 : -100,
                rotate: emojiAnimation.position === 'right' ? 30 : -30
              }}
              animate={{ 
                scale: 2, 
                opacity: 1, 
                x: emojiAnimation.position === 'right' ? 80 : -50,
                rotate: 0
              }}
              exit={{ 
                scale: 2.5, 
                opacity: 0, 
                y: -150
              }}
              transition={{ 
                duration: 0.7, 
                ease: [0.34, 1.56, 0.64, 1]
              }}
              className={`absolute ${
                emojiAnimation.position === 'right' ? 'right-8' : 'left-8'
              } top-1/3`}
            >
              <div className="relative">
                {/* Glow effect */}
                <div className={`absolute inset-0 blur-3xl opacity-50 ${
                  emojiAnimation.type === 'like' 
                    ? 'bg-gradient-to-r from-green-400 to-blue-500' 
                    : 'bg-gradient-to-r from-red-400 to-orange-500'
                }`} />
                {/* Emoji */}
                <div className="relative text-[100px] drop-shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
                  {emojiAnimation.type === 'like' ? '👍' : '👎'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Cards Container */}
      <div className="flex-1 relative">
        
        <AnimatePresence>
          {nextListing && (
            <EnhancedPropertyCard
              listing={nextListing}
              onSwipe={() => {}}
              onTap={() => {}}
              onSuperLike={() => {}}
              onMessage={() => {}}
              isTop={false}
              hasPremium={hasPremiumMessaging}
            />
          )}
          {currentListing && (
            <motion.div
              key={currentListing.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ 
                x: swipeDirection === 'right' ? 300 : swipeDirection === 'left' ? -300 : 0,
                opacity: 0,
                transition: { duration: 0.3 }
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0"
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


      {/* Bottom Action Buttons - 3 Button Layout */}
      <motion.div 
        className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 items-center z-20 px-4"
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
            <ThumbsDown className="w-7 h-7 stroke-[2.5]" />
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