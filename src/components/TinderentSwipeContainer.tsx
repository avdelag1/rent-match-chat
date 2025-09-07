import { useState, useCallback } from 'react';
import { EnhancedPropertyCard } from './EnhancedPropertyCard';
import { UltimateFilters } from './UltimateFilters';
import { SuperLikeButton } from './SuperLikeButton';
import { useListings, useSwipedListings } from '@/hooks/useListings';
import { useSwipe } from '@/hooks/useSwipe';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, X, RotateCcw, Home, SlidersHorizontal, Sparkles, Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TinderentSwipeContainerProps {
  onListingTap: (listingId: string) => void;
  onInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

export function TinderentSwipeContainer({ onListingTap, onInsights, onMessageClick }: TinderentSwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  const { data: swipedIds = [] } = useSwipedListings();
  const { data: listings = [], isLoading, refetch, isRefetching, error } = useListings(swipedIds);
  const swipeMutation = useSwipe();
  const { canAccess: hasPremiumMessaging, needsUpgrade } = useCanAccessMessaging();
  const navigate = useNavigate();

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentListing = listings[currentIndex];
    if (!currentListing) return;

    setSwipeDirection(direction);
    
    // Show visual feedback
    setTimeout(() => {
      swipeMutation.mutate({
        targetId: currentListing.id,
        direction,
        targetType: 'listing'
      });

      // Success toast for right swipe
      if (direction === 'right') {
        toast({
          title: "Liked! 💕",
          description: "Added to your favorites. Maybe it's a match!",
          duration: 2000,
        });
      }

      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  }, [currentIndex, listings, swipeMutation]);

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
      title: '🔄 Fresh Properties!',
      description: 'We loaded the latest listings just for you.',
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
            Try adjusting your filters to see more options.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => setShowFilters(true)}
              variant="outline"
              className="gap-2 w-full"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Adjust Filters
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="gap-2 w-full"
            >
              <RotateCcw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
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
            No more properties match your current filters.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => setShowFilters(true)}
              variant="outline"
              className="gap-2 w-full"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Expand Search
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="gap-2 w-full"
            >
              <RotateCcw className="w-4 h-4" />
              Check for New Listings
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentListing = listings[currentIndex];
  const nextListing = listings[currentIndex + 1];

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* Header with Progress and Filters */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
            className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover:bg-primary/20 gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Ultimate Filters
          </Button>
          
          {Object.keys(appliedFilters).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAppliedFilters({});
                setCurrentIndex(0);
              }}
              className="bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20 hover:bg-destructive/20"
            >
              Clear ({Object.values(appliedFilters).flat().filter(Boolean).length})
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Property {currentIndex + 1} of {listings.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Cards Container */}
      <div className="relative w-full h-[600px]">
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

      {/* Action Buttons */}
      <motion.div 
        className="flex justify-center gap-6 items-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          size="lg"
          variant="outline"
          className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/30 border-2 border-red-400/40 text-red-500 hover:from-red-500/30 hover:to-red-600/40 hover:border-red-400/60 hover:scale-110 transition-all duration-300 animate-glow-pulse hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
          onClick={() => handleButtonSwipe('left')}
          disabled={swipeMutation.isPending}
        >
          <X className="w-8 h-8" />
        </Button>
        
        {/* Super Like Button */}
        {currentListing && (
          <SuperLikeButton
            targetId={currentListing.id}
            targetType="listing"
            onSuperLike={handleSuperLike}
            disabled={swipeMutation.isPending}
          />
        )}
        
        <Button
          size="lg"
          className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-110 transition-all duration-300 animate-glow-pulse shadow-[0_0_40px_rgba(34,197,94,0.5)] hover:shadow-[0_0_60px_rgba(34,197,94,0.7)] animate-dynamic-gradient"
          onClick={() => handleButtonSwipe('right')}
          disabled={swipeMutation.isPending}
        >
          <Heart className="w-8 h-8 text-white animate-heart-beat" />
        </Button>
      </motion.div>

      {/* Ultimate Filters Dialog */}
      <UltimateFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        userRole="client"
        onApplyFilters={handleApplyFilters}
        currentFilters={appliedFilters}
      />
    </div>
  );
}