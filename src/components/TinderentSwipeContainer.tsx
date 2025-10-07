import { useState, useCallback, useMemo } from 'react';
import { EnhancedPropertyCard } from './EnhancedPropertyCard';
import { useSwipedListings } from '@/hooks/useListings';
import { useInfiniteListingMatching } from '@/hooks/useInfiniteListingMatching';
import { useSwipe } from '@/hooks/useSwipe';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flame, X, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';

interface TinderentSwipeContainerProps {
  onListingTap: (listingId: string) => void;
  onInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
  locationFilter?: {
    latitude: number;
    longitude: number;
    city?: string;
    radius: number;
  } | null;
}

export function TinderentSwipeContainer({ onListingTap, onInsights, onMessageClick, locationFilter }: TinderentSwipeContainerProps) {
  const [swipedListings, setSwipedListings] = useState<Set<string>>(new Set());
  
  const { data: swipedIds = [] } = useSwipedListings();
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch,
    error 
  } = useInfiniteListingMatching(swipedIds);
  
  const swipeMutation = useSwipe();
  const { canAccess: hasPremiumMessaging, needsUpgrade } = useCanAccessMessaging();
  const navigate = useNavigate();

  const listings = useMemo(() => {
    return (data?.pages.flatMap(page => page.listings).filter(
      listing => !swipedListings.has(listing.id)
    ) || []) as any[];
  }, [data, swipedListings]);

  const handleSwipe = useCallback((listingId: string, direction: 'left' | 'right') => {
    setSwipedListings(prev => new Set(prev).add(listingId));
    
    swipeMutation.mutate({
      targetId: listingId,
      direction,
      targetType: 'listing'
    });

    if (direction === 'right') {
      toast({
        title: "Liked! 💕",
        description: "Added to your favorites. Maybe it's a match!",
        duration: 2000,
      });
    }
  }, [swipeMutation]);

  const handleRefresh = async () => {
    setSwipedListings(new Set());
    await refetch();
    toast({
      title: 'Properties Updated',
      description: 'Latest listings loaded.',
    });
  };

  const handleInsights = (listingId: string) => {
    if (onInsights) {
      onInsights(listingId);
    } else {
      toast({
        title: '🔍 Property Deep Dive',
        description: 'Opening detailed insights...',
      });
    }
  };

  const handleMessage = () => {
    if (needsUpgrade) {
      // Route users to Settings > Subscription instead of showing inline upgrade UI
      navigate('/client/settings#subscription');
      toast({
        title: 'Subscription Required',
        description: 'Manage or upgrade your plan in Settings > Subscription.',
      });
      return;
    }

    if (hasPremiumMessaging) {
      navigate('/messages');
    } else {
      toast({
        title: 'Subscription Required',
        description: 'Manage or upgrade your plan in Settings > Subscription.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[700px] max-w-sm mx-auto">
        <Card className="w-full h-[600px] bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border-2 border-border/50">
          <div className="p-6 space-y-4">
            <Skeleton className="w-full h-64 rounded-lg" />
            <Skeleton className="w-3/4 h-6" />
            <Skeleton className="w-1/2 h-4" />
            <div className="flex space-x-2">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
            </div>
          </div>
        </Card>
        <div className="text-center mt-4 text-muted-foreground">
          <Sparkles className="w-5 h-5 mx-auto mb-2 animate-spin" />
          Finding perfect properties...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[700px] max-w-sm mx-auto flex items-center justify-center">
        <Card className="text-center bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20 p-8">
          <div className="text-6xl mb-4">😞</div>
          <h3 className="text-xl font-bold mb-2">Oops! Something went wrong</h3>
          <p className="text-muted-foreground mb-4">We couldn't load properties right now.</p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="relative w-full h-[700px] max-w-sm mx-auto flex items-center justify-center">
        <Card className="text-center bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 p-8">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-bold mb-2">No Properties Found</h3>
          <p className="text-muted-foreground mb-4">
            Check back later or refresh for new properties.
          </p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="gap-2 w-full"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <InfiniteScroll
        dataLength={listings.length}
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
              <p className="text-sm text-muted-foreground mb-3">Check back later for new properties.</p>
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
        {listings.map((listing) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="max-w-sm mx-auto"
          >
            <EnhancedPropertyCard
              listing={listing}
              onSwipe={(direction) => handleSwipe(listing.id, direction)}
              onTap={() => onListingTap(listing.id)}
              onSuperLike={() => handleSwipe(listing.id, 'right')}
              onMessage={handleMessage}
              isTop={true}
              hasPremium={hasPremiumMessaging}
            />
          </motion.div>
        ))}
      </InfiniteScroll>
    </div>
  );
}