
import { useState, useCallback } from 'react';
import { SwipeCard } from './SwipeCard';
import { useListings, useSwipedListings } from '@/hooks/useListings';
import { useSwipe } from '@/hooks/useSwipe';
import { Button } from '@/components/ui/button';
import { Heart, X, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SwipeContainerProps {
  onListingTap: (listingId: string) => void;
}

export function SwipeContainer({ onListingTap }: SwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: swipedIds = [] } = useSwipedListings();
  const { data: listings = [], isLoading } = useListings(swipedIds);
  const swipeMutation = useSwipe();

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentListing = listings[currentIndex];
    if (!currentListing) return;

    swipeMutation.mutate({
      targetId: currentListing.id,
      direction,
      targetType: 'listing'
    });

    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, listings, swipeMutation]);

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[600px] max-w-sm mx-auto">
        <Skeleton className="absolute inset-0 rounded-xl" />
      </div>
    );
  }

  if (currentIndex >= listings.length) {
    return (
      <div className="relative w-full h-[600px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold mb-2">No more properties!</h3>
          <p className="text-muted-foreground mb-4">Check back later for new listings</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const currentListing = listings[currentIndex];
  const nextListing = listings[currentIndex + 1];

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Cards Container */}
      <div className="relative w-full h-[600px] mb-6">
        {nextListing && (
          <SwipeCard
            listing={nextListing}
            onSwipe={() => {}}
            onTap={() => {}}
            isTop={false}
          />
        )}
        {currentListing && (
          <SwipeCard
            listing={currentListing}
            onSwipe={handleSwipe}
            onTap={() => onListingTap(currentListing.id)}
            isTop={true}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6">
        <Button
          size="lg"
          variant="outline"
          className="w-14 h-14 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300"
          onClick={() => handleButtonSwipe('left')}
          disabled={swipeMutation.isPending}
        >
          <X className="w-6 h-6 text-red-500" />
        </Button>
        
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600"
          onClick={() => handleButtonSwipe('right')}
          disabled={swipeMutation.isPending}
        >
          <Heart className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  );
}
