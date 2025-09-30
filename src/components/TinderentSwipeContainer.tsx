import { useState, useCallback } from 'react';
import { EnhancedPropertyCard } from './EnhancedPropertyCard';
import { UltimateFilters } from './UltimateFilters';

import { useListings, useSwipedListings } from '@/hooks/useListings';
import { useSmartListingMatching } from '@/hooks/useSmartMatching';
import { useSwipe } from '@/hooks/useSwipe';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, X, RotateCcw, Home, SlidersHorizontal, Sparkles, Crown, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TinderentSwipeContainerProps {
  onListingTap: (listingId: string) => void;
  onInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
  showFilters?: boolean;
  onFiltersClose?: () => void;
  onFiltersOpen?: () => void;
  locationFilter?: {
    latitude: number;
    longitude: number;
    city?: string;
    radius: number;
  } | null;
}

export function TinderentSwipeContainer({ onListingTap, onInsights, onMessageClick, showFilters = false, onFiltersClose, onFiltersOpen, locationFilter }: TinderentSwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  const { data: swipedIds = [] } = useSwipedListings();
  const { data: allListings = [], isLoading, refetch, isRefetching, error } = useSmartListingMatching(swipedIds);
  const swipeMutation = useSwipe();

  // Apply local filtering based on appliedFilters
  const listings = allListings.filter(listing => {
    if (!appliedFilters || Object.keys(appliedFilters).length === 0) return true;
    
    // Price filter
    if ((appliedFilters as any).priceRange && listing.price) {
      if (listing.price < (appliedFilters as any).priceRange[0] || listing.price > (appliedFilters as any).priceRange[1]) {
        return false;
      }
    }
    
    // Bedrooms filter
    if ((appliedFilters as any).bedrooms && listing.beds) {
      if (listing.beds < (appliedFilters as any).bedrooms[0] || listing.beds > (appliedFilters as any).bedrooms[1]) {
        return false;
      }
    }
    
    // Property type filter
    if ((appliedFilters as any).propertyTypes && (appliedFilters as any).propertyTypes.length > 0) {
      if (!(appliedFilters as any).propertyTypes.includes(listing.property_type)) {
        return false;
      }
    }
    
    // Location zones filter
    if ((appliedFilters as any).locationZones && (appliedFilters as any).locationZones.length > 0) {
      if (!(appliedFilters as any).locationZones.includes((listing as any).location_zone)) {
        return false;
      }
    }
    
    // Amenities filter
    if ((appliedFilters as any).amenitiesRequired && (appliedFilters as any).amenitiesRequired.length > 0) {
      const listingAmenities = (listing as any).amenities || [];
      const hasRequiredAmenities = (appliedFilters as any).amenitiesRequired.every((amenity: string) => 
        listingAmenities.includes(amenity)
      );
      if (!hasRequiredAmenities) {
        return false;
      }
    }
    
    return true;
  });
  const { canAccess: hasPremiumMessaging, needsUpgrade } = useCanAccessMessaging();
  const navigate = useNavigate();

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
            Try adjusting your filters to see more options.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => onFiltersOpen && onFiltersOpen()}
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
              onClick={() => onFiltersOpen && onFiltersOpen()}
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
    <div className="w-full h-full flex flex-col">
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


      {/* Bottom Action Buttons - Enhanced Design */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-8 items-center z-20"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300 shadow-xl hover:shadow-red-500/20"
            onClick={() => handleButtonSwipe('left')}
            disabled={swipeMutation.isPending}
          >
            <X className="w-6 h-6" />
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="lg"
            className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300 shadow-xl hover:shadow-orange-500/30 border-2 border-orange-400/50 hover:border-orange-300"
            onClick={() => handleButtonSwipe('right')}
            disabled={swipeMutation.isPending}
          >
            <Flame className="w-8 h-8" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Ultimate Filters Dialog */}
      <UltimateFilters
        isOpen={showFilters}
        onClose={() => onFiltersClose?.()}
        userRole="client"
        onApplyFilters={handleApplyFilters}
        currentFilters={appliedFilters}
      />
    </div>
  );
}