import { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClientTinderSwipeCard } from './ClientTinderSwipeCard';
import { SwipeInsightsModal } from './SwipeInsightsModal';
import { MatchCelebration } from './MatchCelebration';
import { useSmartClientMatching, MatchedClientProfile } from '@/hooks/useSmartMatching';
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
import { RotateCcw, AlertCircle, Users, RefreshCw, Search } from 'lucide-react';

interface ClientTinderSwipeContainerProps {
  onClientTap?: (clientId: string) => void;
  onInsights?: (clientId: string) => void;
  onMessageClick?: (clientId: string) => void;
  profiles?: MatchedClientProfile[];
  isLoading?: boolean;
  error?: Error | null;
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
  const [allProfiles, setAllProfiles] = useState<MatchedClientProfile[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [loadingTimeoutExceeded, setLoadingTimeoutExceeded] = useState(false);
  const [includeRecentLikes, setIncludeRecentLikes] = useState(false);
  // Use array instead of Set for React state serialization compatibility
  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Match celebration state
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: MatchedClientProfile;
    ownerProfile?: MatchedClientProfile;
  }>({ isOpen: false });

  // Fetch profiles with pagination
  // isRefreshMode = true shows disliked profiles within 3-day cooldown, but never liked profiles
  const { data: internalProfiles = [], isLoading: internalIsLoading, refetch, error: internalError } = useSmartClientMatching(undefined, page, 10, includeRecentLikes);

  // Filter out swiped profiles
  const profiles = useMemo(() => {
    let baseProfiles = externalProfiles || allProfiles;
    // Filter out any profiles that have been swiped in this session
    if (swipedIds.length > 0) {
      const swipedIdSet = new Set(swipedIds);
      baseProfiles = baseProfiles.filter(p => !swipedIdSet.has(p.user_id));
    }
    return baseProfiles;
  }, [externalProfiles, allProfiles, swipedIds]);

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

    // Immediately add to swiped IDs to prevent re-showing (using array for state serialization)
    setSwipedIds(prev => prev.includes(currentProfile.user_id) ? prev : [...prev, currentProfile.user_id]);

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

    // Small delay for animation smoothness, then update index
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 50);
  }, [currentProfile, swipeMutation, recordSwipe, recordProfileView]);

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
    setIsRefreshing(true);
    triggerHaptic('medium');

    // Reset state for refresh
    // NOTE: includeRecentLikes (now isRefreshMode) = true will:
    // - Show disliked profiles still within 3-day cooldown (random order)
    // - NEVER show liked profiles (they stay hidden forever)
    // - NEVER show profiles past 3-day cooldown (permanently hidden)
    setIncludeRecentLikes(true);
    setCurrentIndex(0);
    setSwipedIds([]); // Clear session swiped IDs
    setPage(0);
    setAllProfiles([]);

    try {
      await refetch();
      toast.success('Profiles Refreshed', { description: 'Showing profiles you passed on. Liked profiles stay matched!' });
    } catch (error) {
      toast.error('Refresh Failed', { description: 'Please try again.' });
    } finally {
      setIsRefreshing(false);
    }
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
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (err?.message === 'QUOTA_EXCEEDED') {
        setUpgradeReason('You\'ve reached your conversation limit. Upgrade to continue:');
        setShowUpgradeDialog(true);
        toast.dismiss('conv');
      } else {
        if (import.meta.env.DEV) {
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
          <Button onClick={handleRefresh} variant="outline" className="gap-2 rounded-full border-primary/40">
            <RotateCcw className="w-4 h-4" />
            Reload clients
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center space-y-6 p-8"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-primary" />
            </div>
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">No Clients Found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Try adjusting your preferences or refresh to discover new clients
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
          </div>
        </motion.div>
      </div>
    );
  }

  // All cards swiped - End of deck
  if (currentIndex >= profiles.length) {
    return (
      <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center space-y-6 p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Search className="w-12 h-12 text-green-500" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h3 className="text-xl font-semibold text-foreground">All Caught Up!</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              You've seen all available clients. Check back later or refresh for new profiles.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-3"
          >
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

            <p className="text-xs text-muted-foreground">
              New clients join daily
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex flex-col" style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}>
      {/* Full-Screen Card Container - Fills viewport with proper aspect ratio */}
      <div className="flex-1 w-full flex items-center justify-center px-3 sm:px-4">
        <div className="relative w-full max-w-[min(100%-24px,560px)] h-full max-h-[calc(100vh-140px)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-black">
          <AnimatePresence mode="sync" initial={false}>
            {/* Current card - single card view to avoid double-card visual bug */}
            {currentProfile && (
              <motion.div
                key={currentProfile.user_id}
                initial={{ scale: 1, y: 0, opacity: 1 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
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
                className="absolute inset-0"
                style={{ willChange: 'transform, opacity', zIndex: 1 }}
              >
                <ClientTinderSwipeCard
                  profile={currentProfile}
                  onSwipe={handleSwipe}
                  onTap={() => onClientTap?.(currentProfile.user_id)}
                  onUndo={canUndo ? handleUndo : undefined}
                  onInsights={handleInsights}
                  hasPremium={true}
                  isTop={true}
                  hideActions={insightsOpen}
                />
              </motion.div>
            )}
          </AnimatePresence>
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
