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
    <div className="w-full max-w-md mx-auto relative pb-24">
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

      {/* Enhanced 3D Action Buttons - Fixed at bottom with backdrop blur */}
      <div className="fixed bottom-20 left-0 right-0 z-50">
        <div className="max-w-md mx-auto bg-gradient-to-t from-black/10 via-transparent to-transparent backdrop-blur-md pb-4 pt-8">
          <div className="flex justify-center items-center gap-6 px-4">
            {/* Dislike Button - 3D Enhanced */}
            <Button
              onClick={handlePass}
              size="lg"
              variant="ghost"
              className="relative w-16 h-16 rounded-full bg-white border-4 border-red-500 text-red-500 hover:bg-gradient-to-br hover:from-red-500 hover:to-rose-600 hover:text-white hover:border-red-600 transition-all duration-300 p-0 shadow-[0_8px_16px_rgba(239,68,68,0.3),0_2px_8px_rgba(239,68,68,0.2),inset_0_-2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_24px_rgba(239,68,68,0.4),0_4px_12px_rgba(239,68,68,0.3)] hover:scale-110 active:scale-95 transform-gpu"
              disabled={swipeMutation.isPending}
            >
              <X className="w-8 h-8 stroke-[3]" />
            </Button>

            {/* Return/Undo Button - 3D Enhanced (Center) */}
            <Button
              onClick={handleRefresh}
              size="lg"
              variant="ghost"
              className="relative w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white border-4 border-yellow-300 hover:from-yellow-500 hover:to-amber-600 hover:border-yellow-400 transition-all duration-300 p-0 shadow-[0_8px_16px_rgba(251,191,36,0.3),0_2px_8px_rgba(251,191,36,0.2),inset_0_-2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_24px_rgba(251,191,36,0.5),0_4px_12px_rgba(251,191,36,0.3),0_0_20px_rgba(251,191,36,0.4)] hover:scale-110 active:scale-95 active:rotate-180 transform-gpu"
              disabled={swipeMutation.isPending}
            >
              <RotateCcw className="w-7 h-7 stroke-[3]" />
            </Button>

            {/* Like Button - 3D Enhanced (Largest) */}
            <Button
              onClick={handleLike}
              size="lg"
              variant="ghost"
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-rose-500 text-white border-4 border-orange-300 hover:from-orange-600 hover:via-pink-600 hover:to-rose-600 hover:border-orange-400 transition-all duration-300 p-0 shadow-[0_8px_16px_rgba(249,115,22,0.4),0_2px_8px_rgba(249,115,22,0.3),inset_0_-2px_4px_rgba(0,0,0,0.1),0_0_30px_rgba(249,115,22,0.2)] hover:shadow-[0_12px_24px_rgba(249,115,22,0.5),0_4px_12px_rgba(249,115,22,0.4),0_0_40px_rgba(249,115,22,0.3)] hover:scale-110 active:scale-95 transform-gpu animate-pulse-subtle"
              disabled={swipeMutation.isPending}
            >
              <Heart className="w-10 h-10 fill-current drop-shadow-lg" />
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
