import { useState, useCallback } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { ClientTinderSwipeCard } from './ClientTinderSwipeCard';
import { SwipeTopBar } from './owner/SwipeTopBar';
import { MatchCelebration } from './MatchCelebration';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useSwipe } from '@/hooks/useSwipe';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { useStartConversation } from '@/hooks/useConversations';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '@/utils/haptics';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, AlertCircle, X, Eye, Heart } from 'lucide-react';

interface ClientTinderSwipeContainerProps {
  onClientTap?: (clientId: string) => void;
  onInsights?: (clientId: string) => void;
  onMessageClick?: (clientId: string) => void;
  profiles?: any[];
  isLoading?: boolean;
  error?: any;
}

export function ClientTinderSwipeContainer({
  onClientTap,
  onInsights,
  onMessageClick,
  profiles: externalProfiles,
  isLoading: externalIsLoading,
  error: externalError,
}: ClientTinderSwipeContainerProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Match celebration state
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });

  // Use external profiles if provided, otherwise fetch internally
  const { data: internalProfiles = [], isLoading: internalIsLoading, refetch, error: internalError } = useSmartClientMatching();
  
  const profiles = externalProfiles || internalProfiles;
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
  const error = externalError !== undefined ? externalError : internalError;

  const swipeMutation = useSwipe();
  const { recordSwipe, undoLastSwipe, canUndo } = useSwipeUndo();
  const startConversation = useStartConversation();

  const currentProfile = profiles[currentIndex];

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!currentProfile) return;

    setSwipeDirection(direction);
    
    // Haptic feedback
    if (direction === 'right') triggerHaptic('success');
    else triggerHaptic('light');

    // Record swipe
    swipeMutation.mutate({
      targetId: currentProfile.user_id,
      direction,
      targetType: 'profile',
    });

    recordSwipe(
      currentProfile.user_id,
      'profile',
      direction === 'left' ? 'pass' : 'like'
    );

    // Move to next card
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  }, [currentProfile, swipeMutation, recordSwipe]);

  const handleUndo = useCallback(async () => {
    await undoLastSwipe();
    setCurrentIndex(prev => Math.max(0, prev - 1));
    triggerHaptic('medium');
    toast.success('Undone', { description: 'Last swipe reversed' });
  }, [undoLastSwipe]);

  const handleButtonSwipe = useCallback((direction: 'left' | 'right') => {
    handleSwipe(direction);
  }, [handleSwipe]);

  const handleRefresh = async () => {
    setCurrentIndex(0);
    await refetch();
    toast.success('Refreshed', { description: 'Latest profiles loaded' });
  };

  const handleInsights = useCallback(() => {
    if (onInsights && currentProfile) {
      onInsights(currentProfile.user_id);
      triggerHaptic('light');
    }
  }, [onInsights, currentProfile]);

  const handleMessage = useCallback(async () => {
    if (!currentProfile) return;

    try {
      toast.loading('Starting conversation...', { id: 'conv' });
      
      const result = await startConversation.mutateAsync({
        otherUserId: currentProfile.user_id,
        initialMessage: "Hi! I'd like to connect with you.",
        canStartNewConversation: true,
      });

      if (result?.conversationId) {
        toast.success('Conversation started!', { id: 'conv' });
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/messages?conversationId=${result.conversationId}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Could not start conversation', { id: 'conv' });
    }
  }, [currentProfile, startConversation, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md h-[600px] flex items-center justify-center">
          <Skeleton className="w-full h-full rounded-3xl" />
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h3 className="text-xl font-bold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-4">Couldn't load profiles</p>
          <Button onClick={handleRefresh} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Empty state
  if (profiles.length === 0) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-2">No Profiles Found</h3>
          <p className="text-muted-foreground mb-4">
            No clients match your preferences right now
          </p>
          <Button onClick={handleRefresh} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Check for New Profiles
          </Button>
        </Card>
      </div>
    );
  }

  // All cards swiped
  if (currentIndex >= profiles.length) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2">You've seen them all!</h3>
          <p className="text-muted-foreground mb-4">Check back later for new profiles</p>
          <Button onClick={handleRefresh} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Check for New Profiles
          </Button>
        </Card>
      </div>
    );
  }

  const nextProfile = profiles[currentIndex + 1];

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-background">
      {/* Top Bar - Fixed */}
      <SwipeTopBar
        currentIndex={currentIndex}
        totalCount={profiles.length}
        onBack={() => navigate(-1)}
        onFilters={() => {
          // Navigate to filters page or open filter dialog
          toast.info('Filters coming soon!');
        }}
      />

      {/* Full-Screen Card Stack - Use absolute positioning like TinderentSwipeContainer */}
      <div className="absolute inset-0 w-full h-full pt-16">
        <AnimatePresence mode="wait">
          {currentProfile && (
            <motion.div
              key={currentProfile.user_id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                x: swipeDirection === 'right' ? 1000 : swipeDirection === 'left' ? -1000 : 0,
                y: 0,
                opacity: 0,
                rotate: swipeDirection === 'right' ? 30 : swipeDirection === 'left' ? -30 : 0,
                scale: 0.85,
                transition: {
                  type: 'spring',
                  stiffness: 400,
                  damping: 35,
                  duration: 0.3,
                },
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className="absolute inset-0 w-full h-full"
            >
              <ClientTinderSwipeCard
                profile={currentProfile}
                onSwipe={handleSwipe}
                onTap={() => onClientTap?.(currentProfile.user_id)}
                onInsights={handleInsights}
                isTop={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Buttons - Positioned Fixed at Bottom (Outside Card Stack) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex items-center justify-center gap-3 sm:gap-4 px-4 py-6 pb-safe pointer-events-auto">
          {/* Undo Button */}
          <motion.div
            whileHover={{ scale: canUndo ? 1.05 : 1 }}
            whileTap={{ scale: canUndo ? 0.95 : 1 }}
          >
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`
                relative h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 p-0 flex items-center justify-center
                transition-all duration-200 shadow-md
                ${canUndo
                  ? 'border-yellow-400 bg-yellow-500/20 hover:bg-yellow-500 hover:text-white text-yellow-300'
                  : 'border-gray-600 bg-gray-600/10 text-gray-600 cursor-not-allowed opacity-50'
                }
              `}
              aria-label="Undo"
            >
              <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </motion.div>

          {/* Pass Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            <button
              onClick={() => handleButtonSwipe('left')}
              className="
                h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-red-400
                bg-red-500/20 hover:bg-red-500 hover:text-white
                text-red-300 p-0 shadow-lg transition-all duration-200
                flex items-center justify-center
              "
              aria-label="Pass"
            >
              <X className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.5]" />
            </button>
          </motion.div>

          {/* Info Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={handleInsights}
              className="
                h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-blue-400
                bg-blue-500/20 hover:bg-blue-500 hover:text-white
                text-blue-300 p-0 shadow-md transition-all duration-200
                flex items-center justify-center
              "
              aria-label="Info"
            >
              <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </motion.div>

          {/* Like Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            <button
              onClick={() => handleButtonSwipe('right')}
              className="
                relative h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2
                bg-gradient-to-br from-orange-400 to-red-500
                border-orange-300 text-white p-0 shadow-lg
                hover:shadow-orange-500/50 transition-all duration-200
                flex items-center justify-center
              "
              aria-label="Like"
            >
              <Heart className="h-6 w-6 sm:h-7 sm:w-7 fill-white" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Match Celebration */}
      <MatchCelebration
        isOpen={matchCelebration.isOpen}
        onClose={() => setMatchCelebration({ ...matchCelebration, isOpen: false })}
        onMessage={handleMessage}
        matchedUser={{
          name: currentProfile?.name || '',
          avatar: currentProfile?.avatar_url,
          role: 'client'
        }}
      />
    </div>
  );
}
