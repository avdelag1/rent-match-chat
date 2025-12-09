import { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { ClientTinderSwipeCard } from './ClientTinderSwipeCard';
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
import { RotateCcw, AlertCircle, Users, RefreshCw, Search } from 'lucide-react';

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
  const [includeRecentLikes, setIncludeRecentLikes] = useState(false);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set()); // Track swiped profiles
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Match celebration state
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });

  // Fetch profiles with pagination
  const { data: internalProfiles = [], isLoading: internalIsLoading, refetch, error: internalError } = useSmartClientMatching(undefined, page, 10, includeRecentLikes);

  // Filter out swiped profiles
  const profiles = useMemo(() => {
    let baseProfiles = externalProfiles || allProfiles;
    // Filter out any profiles that have been swiped in this session
    if (swipedIds.size > 0) {
      baseProfiles = baseProfiles.filter(p => !swipedIds.has(p.user_id));
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
        if (import.meta.env.DEV) {
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
        if (import.meta.env.DEV) {
        }
        return [...prev, ...newProfiles];
      });
    }
  }, [internalProfiles, externalProfiles]);

  // Preload next batch when user is 3 cards away from end
  useEffect(() => {
    const remainingCards = profiles.length - currentIndex;
    if (remainingCards <= 3 && !isLoading && !externalProfiles) {
      if (import.meta.env.DEV) {
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

    // Immediately add to swiped IDs to prevent re-showing
    setSwipedIds(prev => new Set(prev).add(currentProfile.user_id));

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

    // Reset all state for fresh start
    setIncludeRecentLikes(true); // Manual refresh should bring back even recently liked profiles
    setCurrentIndex(0);
    setSwipedIds(new Set()); // Clear swiped IDs to show fresh profiles
    setPage(0);
    setAllProfiles([]);

    try {
      await refetch();
      toast.success('Fresh Profiles Loaded', { description: 'Swipe to find your perfect client!' });
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
    } catch (error: any) {
      if (error?.message === 'QUOTA_EXCEEDED') {
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
      <div className="relative w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="aspect-[9/16] w-full max-h-[70vh] rounded-3xl overflow-hidden bg-card/50">
            <Skeleton className="w-full h-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && profiles.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <AlertCircle className="w-16 h-16 mx-auto text-destructive/70" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Something went wrong</h3>
            <p className="text-muted-foreground text-sm">Couldn't load profiles</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            size="lg"
            className="gap-3 rounded-full px-8 py-6 bg-gradient-to-r from-primary to-primary/80 shadow-xl"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Loading...' : 'Refresh Clients'}
          </Button>
        </motion.div>
      </div>
    );
  }

  // Empty state - No profiles matching filters
  if (profiles.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center space-y-8"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-primary/70" />
            </div>
          </motion.div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-foreground">No Clients Available</h3>
            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
              Tap refresh to load client profiles and start swiping
            </p>
          </div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="lg"
              className="gap-3 rounded-full px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl text-base font-medium"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Loading...' : 'Refresh Clients'}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // All cards swiped - End of deck
  if (currentIndex >= profiles.length) {
    return (
      <div className="relative w-full h-full flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/5 rounded-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Search className="w-10 h-10 text-green-500/70" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-medium text-foreground">All Caught Up!</h3>
            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
              You've seen all clients. Tap refresh to see more profiles.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                size="lg"
                className="gap-3 rounded-full px-8 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl text-base font-medium"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Loading...' : 'Refresh Clients'}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Refresh Button - Always visible in top right corner */}
      <div className="absolute top-2 right-2 z-50">
        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 bg-black/20 backdrop-blur-sm hover:bg-black/30 border border-white/10"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Card Container - Fills available space */}
      <div className="relative w-full h-full max-w-lg mx-auto overflow-visible px-3">
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
                />
              </motion.div>
            )}
          </AnimatePresence>
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
