
import { useState, useCallback } from 'react';
import { ClientProfileCard } from './ClientProfileCard';
import { useClientProfiles, useSwipedClientProfiles } from '@/hooks/useClientProfiles';
import { useSwipe } from '@/hooks/useSwipe';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { Heart, X, RotateCcw, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ClientSwipeContainerProps {
  onProfileTap: (profileId: string) => void;
  onInsights?: (profileId: string) => void;
  onMessageClick?: () => void;
}

export function ClientSwipeContainer({ onProfileTap, onInsights, onMessageClick }: ClientSwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: swipedIds = [] } = useSwipedClientProfiles();
  const { data: profiles = [], isLoading, refetch, isRefetching, error } = useClientProfiles(swipedIds);
  const swipeMutation = useSwipe();
  const { canAccess: hasPremiumMessaging, needsUpgrade } = useCanAccessMessaging();
  const navigate = useNavigate();

  console.log('ClientSwipeContainer - Profiles loaded:', profiles.length, profiles);
  console.log('ClientSwipeContainer - Swiped IDs:', swipedIds.length);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    console.log('Swiping profile:', currentProfile.user_id, 'direction:', direction);

    swipeMutation.mutate({
      targetId: currentProfile.user_id,
      direction,
      targetType: 'profile'
    });

    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, profiles, swipeMutation]);

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

  const handleInsights = (profileId: string) => {
    if (onInsights) {
      onInsights(profileId);
    } else {
      toast({
        title: 'Client Insights',
        description: 'Viewing detailed insights for this client profile.',
      });
    }
  };

  const handleMessage = () => {
    if (needsUpgrade && onMessageClick) {
      // Show upgrade dialog for non-premium users
      onMessageClick();
    } else if (hasPremiumMessaging) {
      // Navigate to messaging dashboard for premium users
      navigate('/messages');
    } else {
      toast({
        title: 'Upgrade Required',
        description: 'You need to upgrade to premium to access messaging features.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading || isRefetching) {
    return (
      <div className="relative w-full h-[600px] max-w-sm mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
          <Skeleton className="w-full h-32 mb-4" />
          <Skeleton className="w-3/4 h-6 mb-2 mx-auto" />
          <Skeleton className="w-1/2 h-4 mx-auto" />
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

  if (profiles.length === 0) {
    return (
      <div className="relative w-full h-[600px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <div className="text-6xl mb-4">
            <Users className="w-16 h-16 mx-auto text-white/60" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">No Client Profiles</h3>
          <p className="text-white/80 mb-4">No client profiles are available right now. This could mean:</p>
          <ul className="text-sm text-white/70 mb-4 text-left">
            <li>• No clients have created profiles yet</li>
            <li>• All profiles have been swiped already</li>
            <li>• Profiles are being loaded</li>
          </ul>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            disabled={isRefetching}
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="relative w-full h-[600px] max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold mb-2 text-white">No more client profiles!</h3>
          <p className="text-white/80 mb-4">You've seen all available client profiles. Check back later or refresh to see if new profiles are available.</p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            disabled={isRefetching}
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Cards Container */}
      <div className="relative w-full h-[600px] mb-6">
        {nextProfile && (
          <ClientProfileCard
            profile={nextProfile}
            onSwipe={() => {}}
            onTap={() => {}}
            onInsights={() => {}}
            onMessage={() => {}}
            isTop={false}
            hasPremium={hasPremiumMessaging}
          />
        )}
        {currentProfile && (
          <ClientProfileCard
            profile={currentProfile}
            onSwipe={handleSwipe}
            onTap={() => onProfileTap(currentProfile.user_id)}
            onInsights={() => handleInsights(currentProfile.user_id)}
            onMessage={handleMessage}
            isTop={true}
            hasPremium={hasPremiumMessaging}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6">
        <Button
          size="lg"
          variant="outline"
          className="w-14 h-14 rounded-full border-red-200 hover:bg-red-50 hover:border-red-300 bg-white/10 border-white/20 text-white hover:bg-red-500/20"
          onClick={() => handleButtonSwipe('left')}
          disabled={swipeMutation.isPending}
        >
          <X className="w-6 h-6 text-red-400" />
        </Button>
        
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
      <div className="mt-4 text-center text-xs text-white/60">
        Profile {currentIndex + 1} of {profiles.length}
      </div>
    </div>
  );
}
