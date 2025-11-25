import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { ClientTinderSwipeCard } from './ClientTinderSwipeCard';
import { SwipeActionButtons } from './SwipeActionButtons';
import { SwipeInsightsModal } from './SwipeInsightsModal';
import { MatchCelebration } from './MatchCelebration';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useSwipe } from '@/hooks/useSwipe';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { useStartConversation } from '@/hooks/useConversations';
import { MessageActivationPackages } from '@/components/MessageActivationPackages';
import { SubscriptionPackages } from '@/components/SubscriptionPackages';
import { useMessageActivations } from '@/hooks/useMessageActivations';
import { useRecordProfileView } from '@/hooks/useProfileRecycling';
import { usePrefetchImages } from '@/hooks/usePrefetchImages';
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
  const [loadingTimeoutExceeded, setLoadingTimeoutExceeded] = useState(false);

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
  const { totalActivations, canSendMessage } = useMessageActivations();

  // Upgrade dialog state
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  // Prefetch images for next 2 profiles (massively improves perceived performance)
  usePrefetchImages({
    currentIndex,
    profiles,
    prefetchCount: 2
  });

  // Add timeout safety to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[ClientTinderSwipeContainer] Loading timeout - forcing fallback');
        }
        setLoadingTimeoutExceeded(true);
      }, 5000); // 5 second timeout
      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeoutExceeded(false);
    }
  }, [isLoading]);

  // Add newly fetched profiles to the stack
  useEffect(() => {
    if (!externalProfiles && internalProfiles.length > 0) {
      setAllProfiles(prev => {
        const existingIds = new Set(prev.map(p => p.user_id));
        const newProfiles = internalProfiles.filter(p => !existingIds.has(p.user_id));
        if (process.env.NODE_ENV === 'development') {
          console.log('[ClientTinderSwipeContainer] Adding profiles:', internalProfiles.length);
          console.log('[ClientTinderSwipeContainer] New profiles to add:', newProfiles.length);
        }
        return [...prev, ...newProfiles];
      });
    }
  }, [internalProfiles, externalProfiles]);

  // Preload next batch when user is 3 cards away from end
  useEffect(() => {
    const remainingCards = profiles.length - currentIndex;
    if (remainingCards <= 3 && !isLoading && !externalProfiles) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ClientTinderSwipeContainer] Preloading next page, remaining cards:', remainingCards);
      }
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

    // Move to next card (exit animation handled by Framer Motion)
    setCurrentIndex(prev => prev + 1);
    setSwipeDirection(null);
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

    // Check if user has activations before starting conversation
    if (!canSendMessage || totalActivations === 0) {
      setUpgradeReason('You need message activations to start conversations. Choose a package below:');
      setShowUpgradeDialog(true);
      return;
    }

    try {
      toast.loading('Starting conversation...', { id: 'conv' });
      
      const result = await startConversation.mutateAsync({
        otherUserId: currentProfile.user_id,
        initialMessage: "Hi! I'd like to connect with you.",
        canStartNewConversation: canSendMessage,
      });

      if (result?.conversationId) {
        toast.success('Conversation started!', { id: 'conv' });
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/messages?conversationId=${result.conversationId}`);
      }
    } catch (error: any) {
      if (error?.message === 'QUOTA_EXCEEDED') {
        setUpgradeReason('You\'ve reached your conversation limit. Upgrade to continue:');
        setShowUpgradeDialog(true);
        toast.dismiss('conv');
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error starting conversation:', error);
        }
        toast.error('Could not start conversation', { id: 'conv' });
      }
    }
  }, [currentProfile, startConversation, navigate, canSendMessage, totalActivations]);

  // Loading state - Smooth skeleton that matches card dimensions
  // Don't show loading if: profiles exist OR timeout exceeded OR error occurred
  const shouldShowLoading = isLoading && profiles.length === 0 && !loadingTimeoutExceeded && !error;

  if (shouldShowLoading) {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Skeleton placeholder with exact card dimensions */}
          <div className="aspect-[9/16] w-full rounded-3xl overflow-hidden bg-card/50">
            <Skeleton className="w-full h-full" />
          </div>
          {/* Bottom buttons space */}
          <div className="mt-8 flex items-center justify-center gap-4 h-16 opacity-50">
            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && profiles.length === 0) {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md p-8 text-center border border-destructive/20 bg-destructive/5">
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

  // Loading timeout fallback - no data after 5s
  if (loadingTimeoutExceeded && profiles.length === 0 && !error) {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-bold mb-2">Loading Taking Longer Than Expected</h3>
          <p className="text-muted-foreground mb-4">Please try refreshing or check your connection</p>
          <Button onClick={handleRefresh} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </Card>
      </div>
    );
  }

  // Empty state - No profiles matching filters
  if (profiles.length === 0) {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8">
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

  // All cards swiped - End of deck
  if (currentIndex >= profiles.length) {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5">
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
    <div className="relative w-full h-full flex flex-col items-center justify-start">
      {/* Full-Screen Card Stack */}
      <div className="relative w-full h-[calc(100vh-140px)] max-w-lg mx-auto rounded-t-3xl overflow-hidden">
        <AnimatePresence mode="sync" initial={false}>
          {currentProfile && (
            <motion.div
              key={currentProfile.user_id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                x: swipeDirection === 'right' ? 600 : swipeDirection === 'left' ? -600 : 0,
                y: 0,
                opacity: 0,
                rotate: swipeDirection === 'right' ? 30 : swipeDirection === 'left' ? -30 : 0,
                scale: 0.85,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  mass: 0.8,
                  duration: 0.3
                }
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 1
              }}
              className="w-full h-full"
              style={{ willChange: 'transform, opacity' }}
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

      {/* Action Buttons - Overlay at Bottom of Card */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-40 flex justify-center">
        <div className="w-full max-w-md px-4">
          <SwipeActionButtons
            onUndo={handleUndo}
            onPass={() => handleButtonSwipe('left')}
            onInfo={handleInsights}
            onLike={() => handleButtonSwipe('right')}
            canUndo={canUndo}
          />
        </div>
      </div>
 
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

      {/* Upgrade Dialog */}
      <MessageActivationPackages
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        userRole="client"
      />
    </div>
  );
}
