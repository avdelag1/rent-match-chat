import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { OwnerClientTinderCard } from './OwnerClientTinderCard';
import { MatchCelebration } from './MatchCelebration';
import { ShareDialog } from './ShareDialog';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useSwipeWithMatch } from '@/hooks/useSwipeWithMatch';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { useRecordProfileView } from '@/hooks/useProfileRecycling';
import { usePrefetchImages } from '@/hooks/usePrefetchImages';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Users, Search } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { useStartConversation } from '@/hooks/useConversations';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientSwipeContainerProps {
  onClientTap: (clientId: string) => void;
  onInsights?: (clientId: string) => void;
  onMessageClick?: (clientId: string) => void;
  profiles?: any[]; // Accept profiles from parent
  isLoading?: boolean;
  error?: any;
  insightsOpen?: boolean; // Whether insights modal is open - hides action buttons
}

const ClientSwipeContainerComponent = ({
  onClientTap,
  onInsights,
  onMessageClick,
  profiles: externalProfiles,
  isLoading: externalIsLoading,
  error: externalError,
  insightsOpen = false
}: ClientSwipeContainerProps) => {
  const navigate = useNavigate();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });

  // CONSTANT-TIME SWIPE DECK: Use refs for queue management (no re-renders on swipe)
  const deckQueueRef = useRef<any[]>([]);
  const currentIndexRef = useRef(0);
  const swipedIdsRef = useRef<Set<string>>(new Set());
  const [renderKey, setRenderKey] = useState(0); // Force update trigger

  // Use external profiles if provided, otherwise fetch internally (fallback for standalone use)
  const [isRefreshMode, setIsRefreshMode] = useState(false);
  const [page, setPage] = useState(0);
  const isFetchingMore = useRef(false);

  const { data: internalProfiles = [], isLoading: internalIsLoading, refetch, isRefetching, error: internalError } = useSmartClientMatching(undefined, page, 50, isRefreshMode);

  const clientProfiles = externalProfiles || internalProfiles;
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
  const error = externalError !== undefined ? externalError : internalError;

  const swipeMutation = useSwipeWithMatch({
    onMatch: (clientProfile, ownerProfile) => {
      setMatchCelebration({
        isOpen: true,
        clientProfile,
        ownerProfile
      });
    }
  });
  const { canAccess: hasPremiumMessaging, needsUpgrade } = useCanAccessMessaging();
  const { recordSwipe, undoLastSwipe, canUndo, isUndoing } = useSwipeUndo();
  const startConversation = useStartConversation();
  const recordProfileView = useRecordProfileView();

  // Prefetch images for next cards
  usePrefetchImages({
    currentIndex: currentIndexRef.current,
    profiles: deckQueueRef.current,
    prefetchCount: 2
  });

  // CONSTANT-TIME: Append new unique profiles to queue
  useEffect(() => {
    if (clientProfiles.length > 0 && !isLoading) {
      const existingIds = new Set(deckQueueRef.current.map(p => p.user_id));
      const newProfiles = clientProfiles.filter(p =>
        !existingIds.has(p.user_id) && !swipedIdsRef.current.has(p.user_id)
      );

      if (newProfiles.length > 0) {
        deckQueueRef.current = [...deckQueueRef.current, ...newProfiles];
        // Cap at 50 profiles
        if (deckQueueRef.current.length > 50) {
          const offset = deckQueueRef.current.length - 50;
          deckQueueRef.current = deckQueueRef.current.slice(offset);
          currentIndexRef.current = Math.max(0, currentIndexRef.current - offset);
        }
        setRenderKey(n => n + 1);
      }
      isFetchingMore.current = false;
    }
  }, [clientProfiles, isLoading]);

  // Get current visible cards for 3-card stack
  const currentIndex = currentIndexRef.current;
  const deckQueue = deckQueueRef.current;
  const topCard = deckQueue[currentIndex];
  const nextCard = deckQueue[currentIndex + 1];
  const thirdCard = deckQueue[currentIndex + 2];

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const profile = deckQueueRef.current[currentIndexRef.current];
    if (!profile) return;

    setSwipeDirection(direction);
    triggerHaptic(direction === 'right' ? 'success' : 'light');

    // CONSTANT-TIME: Just mark as swiped and advance pointer
    swipedIdsRef.current.add(profile.user_id);
    currentIndexRef.current += 1;

    // Record profile view for exclusion logic
    recordProfileView.mutate({
      profileId: profile.user_id,
      viewType: 'profile',
      action: direction === 'left' ? 'pass' : 'like'
    });

    // Record swipe with match checking
    swipeMutation.mutate({
      targetId: profile.user_id,
      direction,
      targetType: 'profile'
    });

    // Record the swipe for undo functionality
    recordSwipe(profile.user_id, 'profile', direction === 'right' ? 'like' : 'pass');

    setSwipeDirection(null);
    setRenderKey(n => n + 1);

    // Fetch more if running low
    if (currentIndexRef.current >= deckQueueRef.current.length - 3 && !isFetchingMore.current) {
      isFetchingMore.current = true;
      setPage(p => p + 1);
    }
  }, [swipeMutation, recordSwipe, recordProfileView]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setIsRefreshMode(false);
    triggerHaptic('medium');

    currentIndexRef.current = 0;
    deckQueueRef.current = [];
    swipedIdsRef.current.clear();
    setPage(0);

    try {
      await refetch();
      sonnerToast.success('New profiles loaded');
    } catch (err) {
      sonnerToast.error('Refresh failed', { description: 'Please try again.' });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleInsights = (clientId: string) => {
    if (onInsights) {
      onInsights(clientId);
    } else {
      sonnerToast.success('Client Insights', {
        description: 'Viewing detailed insights for this client.',
      });
    }
  };

  const handleShare = () => {
    setShareDialogOpen(true);
    triggerHaptic('light');
  };

  const handleConnect = useCallback(async (clientId: string) => {
    if (isCreatingConversation) return;

    setIsCreatingConversation(true);

    try {
      sonnerToast.loading('Creating conversation...', { id: 'start-conv' });

      const result = await startConversation.mutateAsync({
        otherUserId: clientId,
        initialMessage: "Hi! I'd like to connect with you.",
        canStartNewConversation: true,
      });

      if (result?.conversationId) {
        sonnerToast.success('Opening chat...', { id: 'start-conv' });
        await new Promise(resolve => setTimeout(resolve, 300));
        navigate(`/messages?conversationId=${result.conversationId}`);
      }
    } catch (error) {
      sonnerToast.error('Could not start conversation', {
        id: 'start-conv',
        description: error instanceof Error ? error.message : 'Try again'
      });
    } finally {
      setIsCreatingConversation(false);
    }
  }, [isCreatingConversation, startConversation, navigate]);

  // Skeleton loading state - matches TinderentSwipeContainer
  if (isLoading && deckQueue.length === 0) {
    return (
      <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex flex-col px-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-0 rounded-3xl overflow-hidden bg-muted/30 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
                   style={{ animationDuration: '1.5s', backgroundSize: '200% 100%' }} />
            </div>
            <div className="absolute top-3 left-0 right-0 z-30 flex justify-center gap-1 px-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={`skeleton-dot-${num}`} className="flex-1 h-1 rounded-full bg-white/20" />
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-xl rounded-t-[24px] p-4 pt-6">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-1.5 bg-white/30 rounded-full" />
              </div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-white/20" />
                  <Skeleton className="h-4 w-1/2 bg-white/15" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-6 w-20 bg-white/20" />
                  <Skeleton className="h-3 w-12 bg-white/15 ml-auto" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-4 w-12 bg-white/15" />
                <Skeleton className="h-4 w-12 bg-white/15" />
                <Skeleton className="h-4 w-16 bg-white/15" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex justify-center items-center py-3 px-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-14 h-14 rounded-full bg-muted/40" />
            <Skeleton className="w-11 h-11 rounded-full bg-muted/30" />
            <Skeleton className="w-11 h-11 rounded-full bg-muted/30" />
            <Skeleton className="w-14 h-14 rounded-full bg-muted/40" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20 rounded-xl p-8">
          <div className="text-6xl mb-4">😞</div>
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  if (deckQueue.length === 0) {
    return (
      <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center space-y-6 p-8"
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-primary" />
            </div>
          </motion.div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">No Clients Found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Try adjusting your filters or refresh to discover new clients
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2 rounded-full px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Loading...' : 'Refresh Clients'}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (currentIndex >= deckQueue.length) {
    return (
      <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center space-y-6 p-8"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}>
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full flex items-center justify-center">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <Search className="w-12 h-12 text-green-500" />
              </motion.div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">All Caught Up!</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              You've seen all available clients. Check back later or refresh for new profiles.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2 rounded-full px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg text-base"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Finding Clients...' : 'Discover More'}
              </Button>
            </motion.div>
            <p className="text-xs text-muted-foreground">New clients are joining daily</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Main swipe view with 3-card stack
  return (
    <div className="relative w-full h-full flex-1 flex flex-col max-w-lg mx-auto px-3">
      <div className="relative flex-1 w-full">
        {/* 3-CARD STACK: Render next-next, next, then current on top */}
        {/* Third card (behind) - static, minimal styling */}
        {thirdCard && (
          <div
            key={`third-${thirdCard.user_id}`}
            className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden"
            style={{
              transform: 'scale(0.9) translateY(16px)',
              opacity: 0.5,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            <div className="w-full h-full bg-muted/50 rounded-3xl" />
          </div>
        )}

        {/* Second card (behind current) - static, light styling */}
        {nextCard && (
          <div
            key={`next-${nextCard.user_id}`}
            className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden"
            style={{
              transform: 'scale(0.95) translateY(8px)',
              opacity: 0.7,
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            <div className="w-full h-full bg-muted/30 rounded-3xl" />
          </div>
        )}

        {/* Current card on top - fully interactive */}
        <AnimatePresence mode="popLayout">
          {topCard && (
            <motion.div
              key={topCard.user_id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                x: swipeDirection === 'right' ? 400 : swipeDirection === 'left' ? -400 : 0,
                opacity: 0,
                rotate: swipeDirection === 'right' ? 15 : swipeDirection === 'left' ? -15 : 0,
                scale: 0.85,
                transition: { type: "spring", stiffness: 500, damping: 35, mass: 0.5 }
              }}
              transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.5 }}
              className="w-full h-full absolute inset-0"
              style={{ willChange: 'transform, opacity', zIndex: 10 }}
            >
              <OwnerClientTinderCard
                profile={topCard}
                onSwipe={handleSwipe}
                onTap={() => onClientTap(topCard.user_id)}
                onInsights={() => handleInsights(topCard.user_id)}
                onMessage={() => handleConnect(topCard.user_id)}
                onShare={handleShare}
                onUndo={canUndo ? undoLastSwipe : undefined}
                isTop={true}
                hasPremium={hasPremiumMessaging}
                hideActions={insightsOpen}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MatchCelebration
        isOpen={matchCelebration.isOpen}
        onClose={() => setMatchCelebration({ isOpen: false })}
        matchedUser={{
          name: matchCelebration.clientProfile?.name || 'User',
          avatar: matchCelebration.clientProfile?.images?.[0],
          role: 'client'
        }}
        onMessage={() => topCard?.user_id && handleConnect(topCard.user_id)}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        profileId={topCard?.user_id}
        title={topCard?.name ? `Check out ${topCard.name}'s profile` : 'Check out this profile'}
        description={`Budget: $${topCard?.budget_max?.toLocaleString() || 'N/A'} - Looking for: ${topCard?.preferred_listing_types?.join(', ') || 'Various properties'}`}
      />
    </div>
  );
};

export const ClientSwipeContainer = memo(ClientSwipeContainerComponent);

// Also export default for backwards compatibility
export default ClientSwipeContainer;
