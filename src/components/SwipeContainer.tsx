import { useState, useCallback } from 'react';
import { TinderentSwipeContainer } from './TinderentSwipeContainer';
import { SuperLikeButton } from './SuperLikeButton';
import { useListings, useSwipedListings } from '@/hooks/useListings';
import { useSwipe } from '@/hooks/useSwipe';
import { useCanAccessMessaging } from '@/hooks/useMessaging';
import { Button } from '@/components/ui/button';
import { Flame, X, RotateCcw, Home, Filter, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SwipeContainerProps {
  onListingTap: (listingId: string) => void;
  onInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

export function SwipeContainer({ onListingTap, onInsights, onMessageClick }: SwipeContainerProps) {
  return (
    <TinderentSwipeContainer 
      onListingTap={onListingTap}
      onInsights={onInsights}
      onMessageClick={onMessageClick}
    />
  );
}
