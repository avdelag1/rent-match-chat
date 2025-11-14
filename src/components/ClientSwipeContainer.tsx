import { useState, useCallback } from 'react';
import { OwnerSwipeCard } from './OwnerSwipeCard';
import { MatchCelebration } from './MatchCelebration';
import { useSwipeWithMatch } from '@/hooks/useSwipeWithMatch';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { X, Heart, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast as sonnerToast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/utils/haptics';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientSwipeContainerProps {
  onClientTap: (clientId: string) => void;
  onInsights?: (clientId: string) => void;
  onMessageClick?: (clientId: string) => void;
  profiles?: any[];
  isLoading?: boolean;
  error?: any;
}

export function ClientSwipeContainer({ 
  onClientTap, 
  onInsights, 
  onMessageClick,
  profiles = [],
  isLoading = false,
  error 
}: ClientSwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });

  const swipeMutation = useSwipeWithMatch({
    onMatch: (clientProfile, ownerProfile) => {
      setMatchCelebration({
        isOpen: true,
        clientProfile,
        ownerProfile
      });
    }
  });

  const { recordSwipe, undoLastSwipe, canUndo, isUndoing } = useSwipeUndo();

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentClient = profiles[currentIndex];
    if (!currentClient) return;

    triggerHaptic(direction === 'right' ? 'success' : 'light');
    
    swipeMutation.mutate({
      targetId: currentClient.user_id,
      direction,
      targetType: 'profile'
    });

    recordSwipe(currentClient.user_id, 'profile', direction === 'right' ? 'like' : 'pass');

    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  }, [currentIndex, profiles, swipeMutation, recordSwipe]);

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  const handleUndo = () => {
    if (canUndo && currentIndex > 0) {
      undoLastSwipe();
      setCurrentIndex(prev => prev - 1);
      sonnerToast.success('Swipe undone');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-background">
        <div className="w-[90vw] max-w-md h-[70vh] rounded-3xl overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <p className="text-muted-foreground">Error loading profiles</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h3 className="text-2xl font-bold mb-2">No More Profiles</h3>
          <p className="text-muted-foreground mb-4">Check back later for new clients!</p>
          <Button onClick={() => setCurrentIndex(0)} variant="outline">
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-background">
      {/* Swipe Cards Stack */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md h-[75vh] md:h-[80vh]">
          <AnimatePresence>
            {nextProfile && (
              <OwnerSwipeCard
                key={nextProfile.user_id}
                profile={nextProfile}
                onSwipe={() => {}}
                isTop={false}
              />
            )}
            {currentProfile && (
              <OwnerSwipeCard
                key={currentProfile.user_id}
                profile={currentProfile}
                onSwipe={handleSwipe}
                isTop={true}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center gap-4 z-50 px-4">
        <Button
          size="lg"
          variant="outline"
          onClick={() => handleButtonSwipe('left')}
          disabled={swipeMutation.isPending}
          className="h-16 w-16 rounded-full bg-background/80 backdrop-blur-sm border-2 border-red-500 hover:bg-red-500/10"
        >
          <X className="h-8 w-8 text-red-500" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={handleUndo}
          disabled={!canUndo || isUndoing}
          className="h-14 w-14 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => handleButtonSwipe('right')}
          disabled={swipeMutation.isPending}
          className="h-16 w-16 rounded-full bg-background/80 backdrop-blur-sm border-2 border-green-500 hover:bg-green-500/10"
        >
          <Heart className="h-8 w-8 text-green-500" />
        </Button>
      </div>

      {/* Match Celebration */}
      <MatchCelebration
        isOpen={matchCelebration.isOpen}
        onClose={() => setMatchCelebration({ isOpen: false })}
        onMessage={() => {
          if (matchCelebration.clientProfile && onMessageClick) {
            onMessageClick(matchCelebration.clientProfile.id || matchCelebration.clientProfile.user_id);
          }
        }}
        matchedUser={{
          name: matchCelebration.clientProfile?.name || 'Client',
          avatar: matchCelebration.clientProfile?.avatar_url,
          role: 'client'
        }}
      />
    </div>
  );
}
