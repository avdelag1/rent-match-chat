import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { ClientTinderSwipeCard } from './ClientTinderSwipeCard';
import { SwipeActionButtons } from './SwipeActionButtons';
import { SwipeInsightsModal } from './SwipeInsightsModal';
import { SwipeTopBar } from './owner/SwipeTopBar';
import { MatchCelebration } from './MatchCelebration';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useSwipe } from '@/hooks/useSwipe';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { useStartConversation } from '@/hooks/useConversations';
import { useRecordProfileView } from '@/hooks/useProfileRecycling';
import { useNavigate } from 'react-router-dom';
import { triggerHaptic } from '@/utils/haptics';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, AlertCircle } from 'lucide-react';

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
  const [page, setPage] = useState(0);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);

  // Match celebration state
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });

  // Fetch profiles with pagination
  const { data: internalProfiles = [], isLoading: internalIsLoading, refetch, error: internalError } = useSmartClientMatching(undefined, page, 10);
  
  const profiles = externalProfiles || allProfiles;
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
  const error = externalError !== undefined ? externalError : internalError;

  const swipeMutation = useSwipe();
  const { recordSwipe, undoLastSwipe, canUndo } = useSwipeUndo();
  const startConversation = useStartConversation();
  const recordProfileView = useRecordProfileView();

  // Add newly fetched profiles to the stack
  useEffect(() => {
    if (!externalProfiles && internalProfiles.length > 0) {
      setAllProfiles(prev => {
        const existingIds = new Set(prev.map(p => p.user_id));
        const newProfiles = internalProfiles.filter(p => !existingIds.has(p.user_id));
        return [...prev, ...newProfiles];
      });
    }
  }, [internalProfiles, externalProfiles]);

  // Preload next batch when user is 3 cards away from end
  useEffect(() => {
    const remainingCards = profiles.length - currentIndex;
    if (remainingCards <= 3 && !isLoading && !externalProfiles) {
      setPage(prev => prev + 1);
    }
  }, [currentIndex, profiles.length, isLoading, externalProfiles]);

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

    // Record profile view for smart recycling
    recordProfileView.mutate({
      profileId: currentProfile.user_id,
      viewType: 'profile',
      action: direction === 'left' ? 'pass' : 'like'
    });

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
    setPage(0);
    setAllProfiles([]);
    await refetch();
    toast.success('Refreshed', { description: 'Latest profiles loaded' });
  };

  const handleInsights = useCallback(() => {
    setInsightsOpen(true);
    if (onInsights && currentProfile) {
      onInsights(currentProfile.user_id);
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

      {/* Full-Screen Card Stack */}
      <div className="absolute inset-0 w-full h-full">
        {/* Next Card (Behind) - Peek Effect */}
        {nextProfile && (
          <motion.div
            className="absolute inset-0 w-full h-full"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 0.95, opacity: 0 }}
          >
            <ClientTinderSwipeCard
              profile={nextProfile}
              onSwipe={() => {}}
              isTop={false}
              showNextCard={true}
            />
          </motion.div>
        )}

        {/* Top Card (Active) */}
        <AnimatePresence mode="wait">
          {currentProfile && (
            <motion.div
              key={currentProfile.user_id}
              initial={{ scale: 1, opacity: 1 }}
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

      {/* Action Buttons - Fixed at Bottom */}
      <SwipeActionButtons
        onUndo={handleUndo}
        onPass={() => handleButtonSwipe('left')}
        onInfo={handleInsights}
        onLike={() => handleButtonSwipe('right')}
        canUndo={canUndo}
      />

      {/* Insights Modal */}
      {currentProfile && (
        <SwipeInsightsModal
          open={insightsOpen}
          onOpenChange={setInsightsOpen}
          profile={currentProfile}
        />
      )}

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
