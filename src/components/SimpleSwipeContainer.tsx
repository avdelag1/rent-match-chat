import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, RotateCcw } from 'lucide-react';
import { SimpleListingCard } from './SimpleListingCard';
import { useListings } from '@/hooks/useListings';
import { useSwipe } from '@/hooks/useSwipe';
import { toast } from '@/hooks/use-toast';
import { Button } from './ui/button';

export function SimpleSwipeContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const { data: listings = [], isLoading, refetch } = useListings([]);
  const swipeMutation = useSwipe();

  const currentListing = listings[currentIndex];

  const handleLike = async () => {
    if (!currentListing) return;

    console.log('🔥 LIKE - Saving listing:', currentListing.id);

    setDirection('right');

    try {
      await swipeMutation.mutateAsync({
        targetId: currentListing.id,
        direction: 'right',
        targetType: 'listing'
      });

      console.log('✅ Successfully saved listing!');

      toast({
        title: '❤️ Liked!',
        description: 'Property saved to your favorites',
      });

      // Move to next card after short delay
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setDirection(null);
      }, 300);
    } catch (error) {
      console.error('❌ Error saving listing:', error);
      toast({
        title: 'Error',
        description: 'Could not save listing. Please try again.',
        variant: 'destructive'
      });
      setDirection(null);
    }
  };

  const handlePass = () => {
    if (!currentListing) return;

    console.log('👎 PASS - Skipping listing:', currentListing.id);

    setDirection('left');

    swipeMutation.mutate({
      targetId: currentListing.id,
      direction: 'left',
      targetType: 'listing'
    });

    // Move to next card after short delay
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 300);
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    refetch();
    toast({
      title: 'Refreshed',
      description: 'Listings reloaded',
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-[700px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏠</div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="w-full h-[700px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-2">No Properties Found</h3>
          <p className="text-gray-600 mb-6">Check back later for new listings</p>
          <Button onClick={handleRefresh} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  if (currentIndex >= listings.length) {
    return (
      <div className="w-full h-[700px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">You've seen them all!</h3>
          <p className="text-gray-600 mb-6">Check back later for new properties</p>
          <Button onClick={handleRefresh} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card */}
      <div className="relative mb-6">
        <AnimatePresence mode="wait">
          {currentListing && (
            <motion.div
              key={currentListing.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                x: direction === 'right' ? 300 : direction === 'left' ? -300 : 0,
                opacity: 0,
                transition: { duration: 0.2 }
              }}
            >
              <SimpleListingCard
                listing={currentListing}
                onLike={handleLike}
                onPass={handlePass}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6">
        <Button
          onClick={handlePass}
          size="lg"
          variant="outline"
          className="w-16 h-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50"
          disabled={swipeMutation.isPending}
        >
          <X className="w-8 h-8" />
        </Button>

        <Button
          onClick={handleLike}
          size="lg"
          className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg"
          disabled={swipeMutation.isPending}
        >
          <Heart className="w-10 h-10 fill-current" />
        </Button>
      </div>

    </div>
  );
}
