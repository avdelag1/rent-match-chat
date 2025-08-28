import { useState, useCallback } from 'react';
import { SwipeCard } from './SwipeCard';
import { useListings, useSwipedListings } from '@/hooks/useListings';
import { useSwipe } from '@/hooks/useSwipe';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { Heart, X, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SwipeContainerProps {
  onListingTap: (listingId: string) => void;
  onInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

export function SwipeContainer({ onListingTap, onInsights, onMessageClick }: SwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: swipedIds = [] } = useSwipedListings();
  const { data: listings = [], isLoading, refetch, isRefetching, error } = useListings(swipedIds);
  const swipeMutation = useSwipe();
  const { canAccess: hasPremiumMessaging, needsUpgrade } = useCanAccessMessaging();
  const navigate = useNavigate();

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

  const handleRefresh = async () => {
    setCurrentIndex(0);
    await refetch();
    toast({
      title: 'Refreshed',
      description: 'We reloaded the latest properties.',
    });
  };

  const handleInsights = (listingId: string) => {
    if (onInsights) {
      onInsights(listingId);
    } else {
      toast({
        title: 'Property Insights',
        description: 'Viewing detailed insights for this property.',
      });
    }
  };

  const handleMessage = () => {
    if (needsUpgrade && onMessageClick) {
      // Show upgrade dialog for non-premium users
      onMessageClick();
    } else if (hasPremiumMessaging) {
      // Navigate to messaging dashboard for premium users
      navigate('/messages');
    } else {
      toast({
        title: 'Upgrade Required',
        description: 'You need to upgrade to premium to access messaging features.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading || isRefetching) {
    return (
      <div className="relative w-full h-[600px] max-w-sm mx-auto">
        <Skeleton className="absolute inset-0 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[600px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2 text-white">Something went wrong</h3>
          <p className="text-white/80 mb-4">We couldn't load properties. Please try again.</p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (currentIndex >= listings.length) {
    return (
      <div className="relative w-full h-[600px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-bold mb-2 text-white">No more properties!</h3>
          <p className="text-white/80 mb-4">Check back later or refresh to see if new properties are available.</p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            disabled={isRefetching}
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
            onInsights={() => {}}
            onMessage={() => {}}
            isTop={false}
            hasPremium={hasPremiumMessaging}
          />
        )}
        {currentListing && (
          <SwipeCard
            listing={currentListing}
            onSwipe={handleSwipe}
            onTap={() => onListingTap(currentListing.id)}
            onInsights={() => handleInsights(currentListing.id)}
            onMessage={handleMessage}
            isTop={true}
            hasPremium={hasPremiumMessaging}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6">
        <Button
          size="lg"
          variant="outline"
          className="w-14 h-14 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300 bg-white/10 border-white/20 text-white hover:bg-red-500/20"
          onClick={() => handleButtonSwipe('left')}
          disabled={swipeMutation.isPending}
        >
          <X className="w-6 h-6 text-red-400" />
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
