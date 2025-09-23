
import { useState, useCallback } from 'react';
import { ClientProfileCard } from './ClientProfileCard';
import { AdvancedFilters } from './AdvancedFilters';
import { SuperLikeButton } from './SuperLikeButton';
import { MatchCelebration } from './MatchCelebration';
import { useClientProfiles, useSwipedClientProfiles } from '@/hooks/useClientProfiles';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useSwipeWithMatch } from '@/hooks/useSwipeWithMatch';
import { useNavigate } from 'react-router-dom';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flame, X, RotateCcw, Users, Filter, Zap, ThumbsDown, ThumbsUp, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ClientSwipeContainerProps {
  onClientTap: (clientId: string) => void;
  onInsights?: (clientId: string) => void;
  onMessageClick?: () => void;
}

export function ClientSwipeContainer({ onClientTap, onInsights, onMessageClick }: ClientSwipeContainerProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });
  
  const { data: swipedIds = [] } = useSwipedClientProfiles();
  const { data: clientProfiles = [], isLoading, refetch, isRefetching, error } = useSmartClientMatching();
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

  console.log('ClientSwipeContainer - Profiles loaded:', clientProfiles.length, clientProfiles);
  console.log('ClientSwipeContainer - Swiped IDs:', swipedIds.length);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentClient = clientProfiles[currentIndex];
    if (!currentClient) return;

    console.log('Swiping client:', currentClient.user_id, 'direction:', direction);

    setSwipeDirection(direction);
    
    // Show visual feedback
    setTimeout(() => {
      swipeMutation.mutate({
        targetId: currentClient.user_id,
        direction,
        targetType: 'profile'
      });

      // Show success message for owners
      if (direction === 'right') {
        toast({
          title: '💚 Liked!',
          description: `You liked ${currentClient.name}'s profile.`,
        });
      }

      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  }, [currentIndex, clientProfiles, swipeMutation]);

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

  const handleMessage = () => {
    if (needsUpgrade && onMessageClick) {
      onMessageClick();
    } else {
      toast({
        title: 'Messaging',
        description: 'Message feature coming soon.',
      });
    }
  };

  const handleStartConversation = (clientId: string) => {
    if (needsUpgrade && onMessageClick) {
      onMessageClick();
    } else {
      // Navigate to messaging with this specific client
      navigate(`/messaging?startConversation=${clientId}`);
    }
  };

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setCurrentIndex(0);
    
    const activeFiltersCount = Object.values(filters).flat().filter(Boolean).length;
    toast({
      title: '✨ Filters Applied',
      description: `Found tenants matching your ${activeFiltersCount} preferences.`,
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
          Finding perfect tenants...
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
          <p className="text-muted-foreground mb-4">We couldn't load tenant profiles right now.</p>
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
        <div className="text-center bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 rounded-xl p-8">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold mb-2">No Tenants Found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters to see more profiles.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => setShowFilters(true)}
              variant="outline"
              className="gap-2 w-full"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Adjust Filters
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="gap-2 w-full"
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
            No more tenant profiles match your current filters.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => setShowFilters(true)}
              variant="outline"
              className="gap-2 w-full"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Expand Search
            </Button>
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
      </div>
    );
  }

  const currentClient = clientProfiles[currentIndex];
  const nextClient = clientProfiles[currentIndex + 1];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Full Screen Cards Container */}
      <div className="flex-1 relative">
        <AnimatePresence>
          {nextClient && (
            <ClientProfileCard
              profile={nextClient}
              onSwipe={() => {}}
              onTap={() => {}}
              onInsights={() => {}}
              onMessage={() => {}}
              isTop={false}
              hasPremium={hasPremiumMessaging}
            />
          )}
          {currentClient && (
            <motion.div
              key={currentClient.user_id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ 
                x: swipeDirection === 'right' ? 300 : swipeDirection === 'left' ? -300 : 0,
                opacity: 0,
                transition: { duration: 0.3 }
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0"
            >
              <ClientProfileCard
                profile={currentClient}
                onSwipe={handleSwipe}
                onTap={() => onClientTap(currentClient.user_id)}
                onInsights={() => handleInsights(currentClient.user_id)}
                onMessage={handleMessage}
                isTop={true}
                hasPremium={hasPremiumMessaging}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Controls Overlay - Right positioned to avoid menu */}
      <div className="absolute top-4 left-20 right-4 flex justify-start items-center z-20 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(true)}
          className="bg-black/50 hover:bg-black/70 text-white border border-white/30 rounded-full px-4 backdrop-blur-sm"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
        
        {Object.keys(appliedFilters).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAppliedFilters({});
              setCurrentIndex(0);
            }}
            className="bg-black/50 hover:bg-black/70 text-white border border-white/30 rounded-full backdrop-blur-sm"
          >
            Clear ({Object.values(appliedFilters).flat().filter(Boolean).length})
          </Button>
        )}
      </div>

      {/* Action Buttons - Enhanced Design */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-8 items-center z-20"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300 shadow-xl hover:shadow-red-500/20"
            onClick={() => handleButtonSwipe('left')}
            disabled={swipeMutation.isPending}
          >
            <X className="w-6 h-6" />
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            size="lg"
            className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-300 shadow-xl hover:shadow-orange-500/30 border-2 border-orange-400/50 hover:border-orange-300"
            onClick={() => handleButtonSwipe('right')}
            disabled={swipeMutation.isPending}
          >
            <Flame className="w-8 h-8" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Advanced Filters Dialog */}
      <AdvancedFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        userRole="owner"
        onApplyFilters={handleApplyFilters}
        currentFilters={appliedFilters}
      />

      <MatchCelebration
        isOpen={matchCelebration.isOpen}
        onClose={() => setMatchCelebration({ isOpen: false })}
        matchedUser={{
          name: matchCelebration.clientProfile?.name || 'User',
          avatar: matchCelebration.clientProfile?.images?.[0],
          role: 'client'
        }}
        onMessage={() => handleStartConversation(currentClient?.id?.toString() || '')}
      />
    </div>
  );
}
