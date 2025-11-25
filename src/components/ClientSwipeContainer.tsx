import { useState, useCallback } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { OwnerClientTinderCard } from './OwnerClientTinderCard';
import { SwipeActionButtons } from './SwipeActionButtons';
import { MatchCelebration } from './MatchCelebration';
import { MatchPercentageBadge } from './MatchPercentageBadge';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useSwipeWithMatch } from '@/hooks/useSwipeWithMatch';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, Sparkles, Heart, SlidersHorizontal, MessageCircle, Eye, ArrowLeft, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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
}

export function ClientSwipeContainer({ 
  onClientTap, 
  onInsights, 
  onMessageClick,
  profiles: externalProfiles,
  isLoading: externalIsLoading,
  error: externalError 
}: ClientSwipeContainerProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });

  // Use external profiles if provided, otherwise fetch internally (fallback for standalone use)
  const { data: internalProfiles = [], isLoading: internalIsLoading, refetch, isRefetching, error: internalError } = useSmartClientMatching();
  
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


  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentClient = clientProfiles[currentIndex];
    if (!currentClient) return;

    setSwipeDirection(direction);
    
    // Trigger haptic feedback
    triggerHaptic(direction === 'right' ? 'success' : 'light');

    // Record swipe with match checking
    swipeMutation.mutate({
      targetId: currentClient.user_id,
      direction,
      targetType: 'profile'
    });

    // Record the swipe for undo functionality
    recordSwipe(currentClient.user_id, 'profile', direction === 'right' ? 'like' : 'pass');

    // Move to next card after animation with proper delay for smooth rhythm
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300); // 300ms delay for smooth visual rhythm
  }, [currentIndex, clientProfiles, swipeMutation, recordSwipe]);

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
    setCurrentIndex(0);
    await refetch();
    sonnerToast.success('Refreshed');
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
    return (
      <div className="relative w-[95vw] sm:w-[90vw] md:max-w-xl mx-auto" style={{ minHeight: 'min(85vh, 600px)' }}>
        <div className="w-full h-full bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50 rounded-3xl overflow-hidden">
          <div className="p-6 space-y-4">
            <Skeleton className="w-full h-[60vh] rounded-lg" />
            <Skeleton className="w-3/4 h-6" />
            <Skeleton className="w-1/2 h-4" />
          </div>
        </div>
      </div>
    );
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
      <div className="relative w-full h-[550px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm border-white/40 rounded-xl p-8 shadow-xl max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-foreground mb-3">No Clients Found</h3>
          <Button
            onClick={handleRefresh}
            variant="default"
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

  if (currentIndex >= clientProfiles.length) {
    return (
      <div className="relative w-full h-[550px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-success/10 to-success/5 border-success/20 rounded-xl p-8">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2">All done!</h3>
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

  const currentClient = clientProfiles[currentIndex];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center z-0">
      {/* Refresh Button - Top Right */}
      <div className="absolute top-2 right-2 z-50">
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg bg-background/95 backdrop-blur-sm"
          disabled={isRefetching}
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Single Card Container - No infinite scrolling */}
      <div className="relative w-[95vw] sm:w-[90vw] md:max-w-xl mx-auto mb-20 h-[75vh] sm:h-[65vh] md:h-[600px] max-h-[750px]">
        <AnimatePresence mode="sync">
          {currentClient && (
            <motion.div
              key={currentClient.user_id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1
              }}
              exit={{
                x: swipeDirection === 'right' ? 600 : swipeDirection === 'left' ? -600 : 0,
                opacity: 0,
                rotate: swipeDirection === 'right' ? 10 : swipeDirection === 'left' ? -10 : 0,
                scale: 0.85,
                transition: {
                  type: "spring",
                  stiffness: 180,
                  damping: 15,
                  mass: 0.5,
                  duration: 0.3
                }
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.7
              }}
              className="w-full h-full"
              style={{
                willChange: 'transform, opacity'
              }}
            >
              <OwnerClientTinderCard
                profile={currentClient}
                onSwipe={handleSwipe}
                onTap={() => onClientTap(currentClient.user_id)}
                onInsights={() => handleInsights(currentClient.user_id)}
                onMessage={() => handleConnect(currentClient.user_id)}
                isTop={true}
                hasPremium={hasPremiumMessaging}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Consistent Action Buttons - Matches Client Side */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-40 flex justify-center">
        <div className="w-full max-w-md px-4">
          <SwipeActionButtons
            onUndo={undoLastSwipe}
            onPass={() => handleSwipe('left')}
            onInfo={() => onInsights?.(currentClient.user_id)}
            onLike={() => handleSwipe('right')}
            canUndo={canUndo}
            disabled={swipeMutation.isPending || !currentClient}
          />
        </div>
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
    </div>
  );
}
