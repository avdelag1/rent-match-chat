import { useState, useCallback } from 'react';
import { ClientProfileCard } from './ClientProfileCard';
import { AdvancedFilters } from './AdvancedFilters';
import { SuperLikeButton } from './SuperLikeButton';
import { useClientProfiles, useSwipedClientProfiles } from '@/hooks/useClientProfiles';
import { useSwipe } from '@/hooks/useSwipe';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { Heart, X, RotateCcw, Users, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

interface ClientSwipeContainerProps {
  onClientTap: (clientId: string) => void;
  onInsights?: (clientId: string) => void;
  onMessageClick?: () => void;
}

export function ClientSwipeContainer({ onClientTap, onInsights, onMessageClick }: ClientSwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  
  const { data: swipedIds = [] } = useSwipedClientProfiles();
  const { data: clientProfiles = [], isLoading, refetch, isRefetching, error } = useClientProfiles(swipedIds);
  const swipeMutation = useSwipe();
  const { canAccess: hasPremiumMessaging, needsUpgrade } = useCanAccessMessaging();

  console.log('ClientSwipeContainer - Profiles loaded:', clientProfiles.length, clientProfiles);
  console.log('ClientSwipeContainer - Swiped IDs:', swipedIds.length);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentClient = clientProfiles[currentIndex];
    if (!currentClient) return;

    console.log('Swiping client:', currentClient.user_id, 'direction:', direction);

    swipeMutation.mutate({
      targetId: currentClient.user_id,
      direction,
      targetType: 'profile'
    });

    setCurrentIndex(prev => prev + 1);

    // Show success message for owners
    if (direction === 'right') {
      toast({
        title: 'Client Liked! 💚',
        description: `You liked ${currentClient.name}'s profile.`,
      });
    } else {
      toast({
        title: 'Client Passed',
        description: `You passed on ${currentClient.name}'s profile.`,
      });
    }
  }, [currentIndex, clientProfiles, swipeMutation]);

  const handleSuperLike = useCallback(async (targetId: string, targetType: string) => {
    swipeMutation.mutate({
      targetId,
      direction: 'right',
      targetType: targetType as 'listing' | 'profile'
    });
    setCurrentIndex(prev => prev + 1);
    
    toast({
      title: 'Super Like Sent! ⭐',
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
      title: 'Refreshed',
      description: 'We reloaded the latest client profiles.',
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

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setCurrentIndex(0);
    toast({
      title: 'Filters Applied',
      description: 'Clients updated based on your preferences.',
    });
  };

  if (isLoading || isRefetching) {
    return (
      <div className="relative w-full h-[600px] max-w-sm mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <Skeleton className="w-full h-32 mb-4" />
          <Skeleton className="w-3/4 h-6 mb-2 mx-auto" />
          <Skeleton className="w-1/2 h-4 mx-auto" />
          <p className="text-white/70 mt-4">Loading client profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('ClientSwipeContainer error:', error);
    return (
      <div className="relative w-full h-[600px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2 text-white">Something went wrong</h3>
          <p className="text-white/80 mb-4">We couldn't load client profiles. Please try again.</p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (clientProfiles.length === 0) {
    return (
      <div className="relative w-full h-[600px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <div className="text-6xl mb-4">
            <Users className="w-16 h-16 mx-auto text-white/60" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">No Clients Available</h3>
          <p className="text-white/80 mb-4">No client profiles found. Try refreshing or adjusting filters.</p>
          <div className="space-y-2">
            <Button 
              onClick={() => setShowFilters(true)}
              variant="outline"
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 w-full"
            >
              <Filter className="w-4 h-4" />
              Adjust Filters
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 w-full"
              disabled={isRefetching}
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
      <div className="relative w-full h-[600px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2 text-white">No more clients!</h3>
          <p className="text-white/80 mb-4">You've seen all available clients matching your filters.</p>
          <div className="space-y-2">
            <Button 
              onClick={() => setShowFilters(true)}
              variant="outline"
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 w-full"
            >
              <Filter className="w-4 h-4" />
              Adjust Filters
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 w-full"
              disabled={isRefetching}
            >
              <RotateCcw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentClient = clientProfiles[currentIndex];
  const nextClient = clientProfiles[currentIndex + 1];

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Filter Button */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(true)}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Filter className="w-4 h-4 mr-2" />
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
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Cards Container */}
      <div className="relative w-full h-[600px] mb-6">
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
          <ClientProfileCard
            profile={currentClient}
            onSwipe={handleSwipe}
            onTap={() => onClientTap(currentClient.user_id)}
            onInsights={() => handleInsights(currentClient.user_id)}
            onMessage={handleMessage}
            isTop={true}
            hasPremium={hasPremiumMessaging}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-4">
        <Button
          size="lg"
          variant="outline"
          className="w-14 h-14 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300 bg-white/10 border-white/20 text-white hover:bg-red-500/20"
          onClick={() => handleButtonSwipe('left')}
          disabled={swipeMutation.isPending}
        >
          <X className="w-6 h-6 text-red-400" />
        </Button>
        
        {/* Super Like Button */}
        {currentClient && (
          <SuperLikeButton
            targetId={currentClient.user_id}
            targetType="profile"
            onSuperLike={handleSuperLike}
            disabled={swipeMutation.isPending}
          />
        )}
        
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600"
          onClick={() => handleButtonSwipe('right')}
          disabled={swipeMutation.isPending}
        >
          <Heart className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Debug Info */}
      <div className="text-center text-xs text-white/60">
        Client {currentIndex + 1} of {clientProfiles.length}
      </div>

      {/* Advanced Filters Dialog */}
      <AdvancedFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        userRole="owner"
        onApplyFilters={handleApplyFilters}
        currentFilters={appliedFilters}
      />
    </div>
  );
}
