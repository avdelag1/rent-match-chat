import { useState, useCallback, useMemo } from 'react';
import { ClientProfileCard } from './ClientProfileCard';
import { MatchCelebration } from './MatchCelebration';
import { useInfiniteClientMatching } from '@/hooks/useInfiniteClientMatching';
import { useSwipeWithMatch } from '@/hooks/useSwipeWithMatch';
import { useNavigate } from 'react-router-dom';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flame, X, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';

interface ClientSwipeContainerProps {
  onClientTap: (clientId: string) => void;
  onInsights?: (clientId: string) => void;
  onMessageClick?: () => void;
}

export function ClientSwipeContainer({ onClientTap, onInsights, onMessageClick }: ClientSwipeContainerProps) {
  const navigate = useNavigate();
  const [swipedClients, setSwipedClients] = useState<Set<string>>(new Set());
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });
  
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch,
    error 
  } = useInfiniteClientMatching();
  
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

  const clientProfiles = useMemo(() => {
    return (data?.pages.flatMap(page => page.clients).filter(
      client => !swipedClients.has(client.user_id)
    ) || []) as any[];
  }, [data, swipedClients]);


  const handleSwipe = useCallback((clientId: string, direction: 'left' | 'right') => {
    setSwipedClients(prev => new Set(prev).add(clientId));
    
    swipeMutation.mutate({
      targetId: clientId,
      direction,
      targetType: 'profile'
    });

    if (direction === 'right') {
      const client = clientProfiles.find(c => c.user_id === clientId);
      toast({
        title: '💚 Liked!',
        description: `You liked ${client?.name}'s profile.`,
      });
    }
  }, [swipeMutation, clientProfiles]);

  const handleRefresh = async () => {
    setSwipedClients(new Set());
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

  if (isLoading) {
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
            Check back later or refresh for new profiles.
          </p>
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
    );
  }

  return (
    <div className="w-full h-full">
      <InfiniteScroll
        dataLength={clientProfiles.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        }
        endMessage={
          <div className="text-center py-8">
            <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 p-6 max-w-sm mx-auto">
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-lg font-bold mb-1">All caught up!</h3>
              <p className="text-sm text-muted-foreground mb-3">Check back later for new profiles.</p>
              <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Refresh
              </Button>
            </Card>
          </div>
        }
        scrollThreshold={0.8}
        className="space-y-4 pb-20"
        height="100vh"
      >
        {clientProfiles.map((client) => (
          <motion.div
            key={client.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="max-w-sm mx-auto"
          >
            <ClientProfileCard
              profile={client}
              onSwipe={(direction) => handleSwipe(client.user_id, direction)}
              onTap={() => onClientTap(client.user_id)}
              onInsights={() => onInsights?.(client.user_id)}
              onMessage={handleMessage}
              isTop={true}
              hasPremium={hasPremiumMessaging}
            />
          </motion.div>
        ))}
      </InfiniteScroll>

      <MatchCelebration
        isOpen={matchCelebration.isOpen}
        onClose={() => setMatchCelebration({ isOpen: false })}
        matchedUser={{
          name: matchCelebration.clientProfile?.name || 'User',
          avatar: matchCelebration.clientProfile?.images?.[0],
          role: 'client'
        }}
        onMessage={() => handleStartConversation(clientProfiles[0]?.user_id || '')}
      />
    </div>
  );
}
