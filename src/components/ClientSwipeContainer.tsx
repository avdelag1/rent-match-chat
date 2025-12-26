import { useState, useCallback } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { OwnerClientTinderCard } from './OwnerClientTinderCard';
import { MatchCelebration } from './MatchCelebration';
import { ShareDialog } from './ShareDialog';
import { AppLoadingScreen } from './AppLoadingScreen';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useSwipeWithMatch } from '@/hooks/useSwipeWithMatch';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { useRecordProfileView } from '@/hooks/useProfileRecycling';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
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

export function ClientSwipeContainer({
  onClientTap,
  onInsights,
  onMessageClick,
  profiles: externalProfiles,
  isLoading: externalIsLoading,
  error: externalError,
  insightsOpen = false
}: ClientSwipeContainerProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });

  // Use external profiles if provided, otherwise fetch internally (fallback for standalone use)
  // isRefreshMode: When true, shows disliked profiles within 3-day cooldown (but NEVER liked profiles)
  const [isRefreshMode, setIsRefreshMode] = useState(false);
  const { data: internalProfiles = [], isLoading: internalIsLoading, refetch, isRefetching, error: internalError } = useSmartClientMatching(undefined, 0, 50, isRefreshMode);
  
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


  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentClient = clientProfiles[currentIndex];
    if (!currentClient) return;

    setSwipeDirection(direction);
    
    // Trigger haptic feedback
    triggerHaptic(direction === 'right' ? 'success' : 'light');

    // Record profile view for exclusion logic
    recordProfileView.mutate({
      profileId: currentClient.user_id,
      viewType: 'profile',
      action: direction === 'left' ? 'pass' : 'like'
    });

    // Record swipe with match checking
    swipeMutation.mutate({
      targetId: currentClient.user_id,
      direction,
      targetType: 'profile'
    });

    // Record the swipe for undo functionality
    recordSwipe(currentClient.user_id, 'profile', direction === 'right' ? 'like' : 'pass');

    // Move to next card immediately - no delay for instant response
    setCurrentIndex(prev => prev + 1);
    setSwipeDirection(null);
  }, [currentIndex, clientProfiles, swipeMutation, recordSwipe, recordProfileView]);

  const handleSuperLike = useCallback(async (targetId: string, targetType: string) => {
    swipeMutation.mutate({
      targetId,
      direction: 'right',
      targetType: targetType as 'listing' | 'profile'
    });
    setCurrentIndex(prev => prev + 1);
    
    sonnerToast.success('⭐ Super Like Sent!', {
      description: 'Your super like has been sent to this client.',
    });
  }, [swipeMutation]);

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  const handleRefresh = useCallback(async () => {
    // Keep isRefreshMode as false - normal mode excludes all swiped profiles
    // Note: Liked profiles are NEVER shown again, disliked profiles hidden for 3 days
    setIsRefreshMode(false);
    setCurrentIndex(0);
    await refetch();
    sonnerToast.success('New profiles loaded');
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

        // Brief wait for DB sync
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


  const progress = clientProfiles.length > 0 ? ((currentIndex + 1) / clientProfiles.length) * 100 : 0;

  if (isLoading || isRefetching) {
    return <AppLoadingScreen />;
  }

  if (error) {
    return (
      <div className="relative w-full h-[550px] max-w-sm mx-auto flex items-center justify-center">
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

  if (clientProfiles.length === 0) {
    return (
      <div className="relative w-full h-[550px] max-w-sm mx-auto flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Discover more clients by refreshing
          </p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="gap-2 rounded-full px-6"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  if (currentIndex >= clientProfiles.length) {
    return (
      <div className="relative w-full h-[550px] max-w-sm mx-auto flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            You've seen all available clients
          </p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="gap-2 rounded-full px-6"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const currentClient = clientProfiles[currentIndex];

  return (
    <div className="relative w-full flex flex-col items-center justify-start" style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}>
      {/* Card Container - Full screen swipe experience */}
      <div className="relative w-full h-[calc(100vh-160px)] max-w-lg mx-auto overflow-visible mt-2">
        <AnimatePresence mode="wait">
          {currentClient && (
            <motion.div
              key={currentClient.user_id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{
                x: swipeDirection === 'right' ? 500 : swipeDirection === 'left' ? -500 : 0,
                opacity: 0,
                rotate: swipeDirection === 'right' ? 25 : swipeDirection === 'left' ? -25 : 0,
                scale: 0.9,
                transition: {
                  type: "spring",
                  stiffness: 600,
                  damping: 30,
                  mass: 0.4
                }
              }}
              transition={{
                type: "spring",
                stiffness: 600,
                damping: 35,
                mass: 0.4
              }}
              className="w-full h-full absolute inset-0"
              style={{ willChange: 'transform, opacity', zIndex: 1 }}
            >
              <OwnerClientTinderCard
                profile={currentClient}
                onSwipe={handleSwipe}
                onTap={() => onClientTap(currentClient.user_id)}
                onInsights={() => handleInsights(currentClient.user_id)}
                onMessage={() => handleConnect(currentClient.user_id)}
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
        onMessage={() => currentClient?.user_id && handleConnect(currentClient.user_id)}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        profileId={currentClient?.user_id}
        title={currentClient?.name ? `Check out ${currentClient.name}'s profile` : 'Check out this profile'}
        description={`Budget: $${currentClient?.budget_max?.toLocaleString() || 'N/A'} - Looking for: ${currentClient?.preferred_listing_types?.join(', ') || 'Various properties'}`}
      />
    </div>
  );
}
