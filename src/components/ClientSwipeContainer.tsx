import { useState, useCallback } from 'react';
import { triggerHaptic } from '@/utils/haptics';
import { ClientProfileCard } from './ClientProfileCard';
import { MatchCelebration } from './MatchCelebration';
import { MatchPercentageBadge } from './MatchPercentageBadge';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useSwipeWithMatch } from '@/hooks/useSwipeWithMatch';
import { useNavigate } from 'react-router-dom';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { useSwipeUndo } from '@/hooks/useSwipeUndo';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, Sparkles, Heart, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
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
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });
  const [emojiAnimation, setEmojiAnimation] = useState<{
    show: boolean;
    type: 'like' | 'dislike';
    position: 'left' | 'right';
  }>({ show: false, type: 'like', position: 'right' });
  
  // Use external profiles if provided, otherwise fetch internally (fallback for standalone use)
  const { data: internalProfiles = [], isLoading: internalIsLoading, refetch, isRefetching, error: internalError } = useSmartClientMatching();
  
  const clientProfiles = externalProfiles || internalProfiles;
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
  const error = externalError !== undefined ? externalError : internalError;
  
  // Comprehensive logging
  console.log('🎴 ClientSwipeContainer: external profiles:', externalProfiles?.length || 0);
  console.log('🎴 ClientSwipeContainer: internal profiles:', internalProfiles?.length || 0);
  console.log('🎴 ClientSwipeContainer: final profiles:', clientProfiles?.length || 0);
  console.log('🎴 ClientSwipeContainer: isLoading:', isLoading);
  console.log('🎴 ClientSwipeContainer: error:', error);
  
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


  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentClient = clientProfiles[currentIndex];
    if (!currentClient) return;

    setSwipeDirection(direction);
    
    // Trigger haptic feedback
    triggerHaptic(direction === 'right' ? 'success' : 'light');
    
    // Show emoji immediately for better UX
    setEmojiAnimation({ 
      show: true, 
      type: direction === 'right' ? 'like' : 'dislike',
      position: direction === 'right' ? 'right' : 'left'
    });
    
    setTimeout(() => {
      setEmojiAnimation({ show: false, type: 'like', position: 'right' });
    }, 400);
    
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
    
    toast({
      title: '⭐ Super Like Sent!',
      description: 'Your super like has been sent to this client.',
    });
  }, [swipeMutation]);

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  const handleRefresh = async () => {
    setCurrentIndex(0);
    await refetch();
    toast({
      title: 'Profiles Updated',
      description: 'Latest client profiles loaded.',
    });
  };

  const handleInsights = (clientId: string) => {
    if (onInsights) {
      onInsights(clientId);
    } else {
      toast({
        title: 'Client Insights',
        description: 'Viewing detailed insights for this client.',
      });
    }
  };

  const handleStartConversation = (clientId: string) => {
    console.log('💬 Starting conversation with client:', clientId);
    
    // Always navigate to messages with the client ID
    navigate(`/messages?startConversation=${clientId}`);
    
    // Show toast to confirm
    toast({
      title: 'Opening Chat',
      description: 'Starting conversation...',
    });
  };

  const progress = clientProfiles.length > 0 ? ((currentIndex + 1) / clientProfiles.length) * 100 : 0;

  if (isLoading || isRefetching) {
    return (
      <div className="relative w-full h-[700px] max-w-sm mx-auto">
        <div className="w-full h-[600px] bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50 rounded-xl">
          <div className="p-6 space-y-4">
            <Skeleton className="w-full h-64 rounded-lg" />
            <Skeleton className="w-3/4 h-6" />
            <Skeleton className="w-1/2 h-4" />
            <div className="flex space-x-2">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
          </div>
        </div>
        <div className="text-center mt-4 text-muted-foreground">
          <Sparkles className="w-5 h-5 mx-auto mb-2 animate-spin" />
          Finding perfect clients...
        </div>
      </div>
    );
  }

  if (error) {
    console.error('ClientSwipeContainer error:', error);
    return (
      <div className="relative w-full h-[700px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20 rounded-xl p-8">
          <div className="text-6xl mb-4">😞</div>
          <h3 className="text-xl font-bold mb-2">Oops! Something went wrong</h3>
          <p className="text-muted-foreground mb-4">We couldn't load client profiles right now.</p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (clientProfiles.length === 0) {
    return (
      <div className="relative w-full h-[700px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm border-white/40 rounded-xl p-8 shadow-xl max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-foreground mb-3">No Clients Found</h3>
          <p className="text-muted-foreground mb-4">
            No clients match your current preferences.
          </p>
          
          {/* Debug Information */}
          <div className="text-sm text-muted-foreground space-y-2 bg-orange-100 p-4 rounded-lg mb-4">
            <p className="font-semibold text-orange-900">🐛 Debug Info:</p>
            <ul className="text-left space-y-1 text-orange-800">
              <li>External Profiles: {externalProfiles?.length || 0}</li>
              <li>Internal Profiles: {internalProfiles?.length || 0}</li>
              <li>Final Profiles: {clientProfiles?.length || 0}</li>
              <li>Loading: {isLoading ? 'Yes' : 'No'}</li>
            </ul>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2 bg-muted/30 p-4 rounded-lg mb-4">
            <p className="font-semibold">Tips to find more clients:</p>
            <ul className="list-disc list-inside text-left space-y-1">
              <li>Adjust your budget range</li>
              <li>Expand age preferences</li>
              <li>Remove lifestyle filters</li>
              <li>Ensure clients have photos uploaded</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/owner/filters')}
              variant="outline"
              className="gap-2 flex-1"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Clear Filters
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="default"
              className="gap-2 flex-1"
            >
              <RotateCcw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex >= clientProfiles.length) {
    return (
      <div className="relative w-full h-[700px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-success/10 to-success/5 border-success/20 rounded-xl p-8">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2">You've seen them all!</h3>
          <p className="text-muted-foreground mb-4">
            Check back later for new profiles.
          </p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="gap-2 w-full"
          >
            <RotateCcw className="w-4 h-4" />
            Check for New Profiles
          </Button>
        </div>
      </div>
    );
  }

  const currentClient = clientProfiles[currentIndex];
  const nextClient = clientProfiles[currentIndex + 1];

  // CRITICAL DEBUG
  console.log('🎴 RENDER CHECK:', {
    currentIndex,
    totalProfiles: clientProfiles.length,
    hasCurrentClient: !!currentClient,
    hasNextClient: !!nextClient,
    currentClientName: currentClient?.name,
    nextClientName: nextClient?.name
  });

  return (
    <div className="w-full h-full flex flex-col justify-center relative z-0 max-w-md mx-auto px-4">
      {/* Client Counter */}
      <div className="text-center mb-3 z-20">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} of {clientProfiles.length}
          </span>
        </div>
      </div>

      {/* Emoji Animation Overlay - Fixed positioning for maximum visibility */}
      <AnimatePresence>
        {emojiAnimation.show && (
          <motion.div
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ 
                scale: 0, 
                opacity: 0, 
                x: emojiAnimation.position === 'right' ? 80 : -80,
                rotate: emojiAnimation.position === 'right' ? 15 : -15
              }}
              animate={{ 
                scale: 2.5, 
                opacity: 1, 
                x: emojiAnimation.position === 'right' ? 40 : -40,
                rotate: 0
              }}
              exit={{ 
                scale: emojiAnimation.type === 'like' ? 3.5 : 1.5,
                opacity: 0, 
                y: emojiAnimation.type === 'like' ? -250 : -100,
                x: emojiAnimation.type === 'like' ? 0 : (emojiAnimation.position === 'left' ? -300 : 300),
                rotate: emojiAnimation.type === 'like' ? 0 : (emojiAnimation.position === 'left' ? -75 : 75)
              }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.5
              }}
              style={{ willChange: 'transform, opacity' }}
              className={`absolute ${
                emojiAnimation.position === 'right' ? 'right-8' : 'left-8'
              } top-1/3`}
            >
              <div className="relative">
                {/* Glow effect */}
                <div className={`absolute inset-0 blur-3xl opacity-50 ${
                  emojiAnimation.type === 'like' 
                    ? 'bg-gradient-to-r from-orange-400 to-red-500' 
                    : 'bg-gradient-to-r from-gray-400 to-blue-300'
                }`} />
                {/* Emoji */}
                <div className="relative text-[100px] drop-shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
                  {emojiAnimation.type === 'like' ? '🔥' : '💨'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards Container - Flexible Height */}
      <div className="relative flex-1 w-full max-w-md mx-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        
        <AnimatePresence mode="popLayout">
          {/* Current card - swipes out with rotation and fade */}
          {currentClient && (
            <motion.div
              key={currentClient.user_id}
              initial={{ scale: 0.95, opacity: 0.7, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
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
                stiffness: 200,
                damping: 20,
                mass: 0.8
              }}
              className="absolute inset-0 shadow-2xl"
              style={{
                willChange: 'transform, opacity',
                zIndex: 10,
                filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))'
              }}
            >
              <ClientProfileCard
                profile={currentClient}
                onSwipe={handleSwipe}
                onTap={() => onClientTap(currentClient.user_id)}
                onInsights={() => handleInsights(currentClient.user_id)}
                onMessage={() => handleStartConversation(currentClient.user_id)}
                isTop={true}
                hasPremium={hasPremiumMessaging}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Simple 3-Button Tinder Action Layout */}
      <motion.div 
        className="flex justify-center items-center gap-6 mt-4 mb-2"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Pass Button (X) */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="lg"
            variant="ghost"
            className="w-16 h-16 rounded-full bg-white shadow-xl border-2 border-red-500 text-red-500 hover:bg-red-50 transition-all p-0"
            onClick={() => handleSwipe('left')}
            disabled={swipeMutation.isPending || !currentClient}
            aria-label="Pass"
          >
            <X className="w-8 h-8 stroke-[2.5]" />
          </Button>
        </motion.div>

        {/* Return/Back Button */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="lg"
            variant="ghost"
            className="w-14 h-14 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg transition-all p-0"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={swipeMutation.isPending || !currentClient || currentIndex === 0}
            aria-label="Go Back"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        </motion.div>

        {/* Like Button (Heart) */}
        <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="lg"
            variant="ghost"
            className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-2xl transition-all p-0"
            onClick={() => handleSwipe('right')}
            disabled={swipeMutation.isPending || !currentClient}
            aria-label="Like"
          >
            <Heart className="w-10 h-10 fill-white stroke-white stroke-[1.5]" />
          </Button>
        </motion.div>
      </motion.div>

      <MatchCelebration
        isOpen={matchCelebration.isOpen}
        onClose={() => setMatchCelebration({ isOpen: false })}
        matchedUser={{
          name: matchCelebration.clientProfile?.name || 'User',
          avatar: matchCelebration.clientProfile?.images?.[0],
          role: 'client'
        }}
        onMessage={() => currentClient?.user_id && handleStartConversation(currentClient.user_id)}
      />
    </div>
  );
}
