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
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
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
    navigate(`/messages?startConversation=${clientId}`);
    toast({
      title: 'Opening Chat',
      description: 'Starting conversation...',
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientY);
    const swipeDistance = touchStart - touchEnd;
    const threshold = 50;
    
    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0 && currentIndex < clientProfiles.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (swipeDistance < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const progress = clientProfiles.length > 0 ? ((currentIndex + 1) / clientProfiles.length) * 100 : 0;

  if (isLoading || isRefetching) {
    return (
      <div className="relative w-[95vw] sm:w-[90vw] md:max-w-xl mx-auto" style={{ minHeight: 'min(85vh, 750px)' }}>
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
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center z-0"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

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

      {/* Cards Container - Maximized */}
      <div className="relative w-[95vw] sm:w-[90vw] md:max-w-xl mx-auto mb-20" style={{ minHeight: 'min(85vh, 750px)' }}>
        
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

      {/* Modern 3-Button Action Layout */}
      <motion.div 
        className="flex justify-center items-center gap-5 mt-6 mb-4"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Pass Button (X) - Modern Red */}
        <motion.div 
          whileHover={{ scale: 1.08, y: -2 }} 
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            size="lg"
            variant="ghost"
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-[0_8px_24px_rgba(239,68,68,0.35)] hover:shadow-[0_12px_32px_rgba(239,68,68,0.45)] transition-all duration-300 p-0 border-2 border-white/20"
            onClick={() => handleSwipe('left')}
            disabled={swipeMutation.isPending || !currentClient}
            aria-label="Pass"
          >
            <X className="w-7 h-7 stroke-[3]" />
          </Button>
        </motion.div>

        {/* Return Button - Modern Blue/Purple */}
        <motion.div 
          whileHover={{ scale: 1.08, y: -2 }} 
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            size="lg"
            variant="ghost"
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-[0_8px_24px_rgba(59,130,246,0.35)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.45)] transition-all duration-300 p-0 border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={swipeMutation.isPending || !currentClient || currentIndex === 0}
            aria-label="Go Back"
          >
            <RotateCcw className="w-6 h-6 stroke-[2.5]" />
          </Button>
        </motion.div>

        {/* Like Button (Heart) - Modern Orange/Pink Gradient */}
        <motion.div 
          whileHover={{ scale: 1.08, y: -2 }} 
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            size="lg"
            variant="ghost"
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-rose-500 hover:from-orange-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-[0_8px_24px_rgba(251,146,60,0.4)] hover:shadow-[0_12px_32px_rgba(251,146,60,0.5)] transition-all duration-300 p-0 border-2 border-white/20"
            onClick={() => handleSwipe('right')}
            disabled={swipeMutation.isPending || !currentClient}
            aria-label="Like"
          >
            <Heart className="w-7 h-7 fill-white stroke-white stroke-[2]" />
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
