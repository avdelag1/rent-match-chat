import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { PG_ERROR_CODES } from '@/utils/retryUtils';
import { logger } from '@/utils/prodLogger';

interface SwipeWithMatchOptions {
  onMatch?: (clientProfile: any, ownerProfile: any) => void;
}

export function useSwipeWithMatch(options?: SwipeWithMatchOptions) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      targetId, 
      direction, 
      targetType 
    }: { 
      targetId: string; 
      direction: 'left' | 'right'; 
      targetType: 'listing' | 'profile' 
    }) => {
      // Defensive auth check
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.id || !user?.id) {
        logger.error('Auth check failed:', { currentUser: currentUser?.id, user: user?.id });
        throw new Error('User not authenticated. Please refresh the page.');
      }

      let like: any;

      if (targetType === 'profile') {
        // Owner swiping on a client profile
        if (direction === 'right') {
          // Save like to owner_likes table
          const { data: ownerLike, error: ownerLikeError } = await supabase
            .from('owner_likes')
            .upsert({
              owner_id: user.id,
              client_id: targetId,
              is_super_like: false
            }, {
              onConflict: 'owner_id,client_id',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (ownerLikeError) {
            logger.error('Error saving owner like:', ownerLikeError);
            throw ownerLikeError;
          }
          like = ownerLike;
      } else {
          // For left swipes (dislikes), we use the likes table with direction='left'
          // This avoids needing a separate dislikes table that may not exist
          const { data: dislike, error: dislikeError } = await supabase
            .from('likes')
            .upsert({
              user_id: user.id,
              target_id: targetId,
              direction: 'left'
            }, {
              onConflict: 'user_id,target_id',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (dislikeError) {
            logger.error('Error saving dislike:', dislikeError);
            throw dislikeError;
          }
          like = dislike;
        }
      } else {
        // Client swiping on a listing - save to likes table
        const { data: clientLike, error: likeError } = await supabase
          .from('likes')
          .upsert({
            user_id: user.id,
            target_id: targetId,
            direction
          }, {
            onConflict: 'user_id,target_id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (likeError) {
          logger.error('Error saving like:', likeError);
          throw likeError;
        }
        like = clientLike;
      }

      // OPTIMISTIC: Return immediately after saving swipe
      // Fire-and-forget match detection in background - don't block UI
      if (direction === 'right') {
        // Background match detection - non-blocking
        detectAndCreateMatch({
          targetId,
          targetType,
          userId: user.id,
          onMatch: options?.onMatch
        }).catch(err => {
          // Match errors are non-critical - user can see matches later
          logger.error('[useSwipeWithMatch] Background match detection failed:', err);
        });
      }

      return like;
    },
    onSuccess: (data, variables) => {
      // OPTIMIZED: Invalidate relevant queries based on swipe type
      const isLike = variables.direction === 'right';
      const isDislike = variables.direction === 'left';

      if (isLike && variables.targetType === 'profile') {
        // Owner swiping right on client - DON'T invalidate cache, let it persist
        // The ClientSwipeContainer handles optimistic updates
        // Only invalidate matches to detect new matches
        queryClient.invalidateQueries({ queryKey: ['matches'] }).catch(() => {});
      } else if (isLike && variables.targetType === 'listing') {
        // Client liking listing - DON'T invalidate cache, let optimistic update persist
        // The TinderentSwipeContainer already did optimistic setQueryData
        // Auto-refetch will sync with DB naturally without causing disappearing items
        // Only invalidate matches to detect new matches
        queryClient.invalidateQueries({ queryKey: ['matches'] }).catch(() => {});
      } else if (isDislike) {
        // Invalidate dislikes cache so the disliked profiles are excluded from future fetches
        const invalidations = [
          queryClient.invalidateQueries({ queryKey: ['dislikes'] }),
          queryClient.invalidateQueries({ queryKey: ['client-profiles'] }),
        ];
        Promise.all(invalidations).catch(() => {});
      }
    },
    onError: (error) => {
      logger.error('Swipe error:', error);
      // Only show error toast for critical failures (auth, network), not for edge cases
      // Background swipe errors are handled gracefully in the container
      if (error instanceof Error && (error.message.includes('auth') || error.message.includes('network'))) {
        toast.error("Something went wrong. Please try again.");
      }
      // Silently fail for other errors - the swipe already happened in the UI
    }
  });
}

// Background async match detection - doesn't block swipe UI
async function detectAndCreateMatch({
  targetId,
  targetType,
  userId,
  onMatch
}: {
  targetId: string;
  targetType: 'listing' | 'profile';
  userId: string;
  onMatch?: (clientProfile: any, ownerProfile: any) => void;
}) {
  let mutualLike = null;
  let matchClientId: string;
  let matchOwnerId: string;
  let matchListingId: string | null = null;

  if (targetType === 'listing') {
    // Client swiping on a listing
    const { data: listing } = await supabase
      .from('listings')
      .select('owner_id')
      .eq('id', targetId)
      .maybeSingle();

    if (!listing) {
      logger.error('Listing not found');
      return;
    }

    matchClientId = userId;  // Current user is the client
    matchOwnerId = listing.owner_id;  // Listing owner
    matchListingId = targetId;  // The listing

    // Check if owner liked this client (in owner_likes table)
    const { data: ownerLike } = await supabase
      .from('owner_likes')
      .select('*')
      .eq('owner_id', listing.owner_id)
      .eq('client_id', userId)
      .maybeSingle();

    mutualLike = ownerLike;
  } else {
    // Owner swiping on a client profile
    matchClientId = targetId;  // Target is the client
    matchOwnerId = userId;  // Current user is the owner

    // Get owner's listings to check if client liked any of them
    const { data: ownerListings } = await supabase
      .from('listings')
      .select('id')
      .eq('owner_id', userId);

    if (ownerListings && ownerListings.length > 0) {
      const listingIds = ownerListings.map(l => l.id);

      // Check if client liked any of the owner's listings
      const { data: clientLike } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', targetId)
        .in('target_id', listingIds)
        .eq('direction', 'right')
        .limit(1)
        .maybeSingle();

      mutualLike = clientLike;
      // Use the listing that was liked for the match
      matchListingId = clientLike?.target_id || null;
    } else {
      matchListingId = null;
      mutualLike = null;
    }
  }

  if (mutualLike) {
    // It's a match! Create or update match record with retry logic
    let matchCreated = false;
    let match = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .upsert({
          client_id: matchClientId,
          owner_id: matchOwnerId,
          listing_id: matchListingId,
          is_mutual: true,
          client_liked_at: targetType === 'profile' ? mutualLike.created_at : new Date().toISOString(),
          owner_liked_at: targetType === 'profile' ? new Date().toISOString() : mutualLike.created_at,
          status: 'accepted'
        })
        .select();

      if (!matchError || matchError.code === '23505') {
        // Success or duplicate key (which is fine)
        matchCreated = true;
        match = matchData?.[0];

        // If no match returned (duplicate was ignored), fetch the existing one
        if (!match) {
          const query = supabase
            .from('matches')
            .select()
            .eq('client_id', matchClientId)
            .eq('owner_id', matchOwnerId);

          if (matchListingId) {
            query.eq('listing_id', matchListingId);
          } else {
            query.is('listing_id', null);
          }

          const { data: existingMatch } = await query.maybeSingle();
          match = existingMatch;
        }

        break;
      }

      logger.error(`[detectAndCreateMatch] Match creation attempt ${attempt}/3 failed:`, matchError);

      if (attempt < 3) {
        // Exponential backoff: 300ms, 600ms
        await new Promise(resolve => setTimeout(resolve, attempt * 300));
      }
    }

    if (!matchCreated) {
      logger.error('[detectAndCreateMatch] Failed to create match after 3 attempts');
      toast.error("Match creation failed. Please try again.");
      return;
    }

    if (match) {
      // Create conversation explicitly after match is created
      const { error: conversationError } = await supabase
        .from('conversations')
        .upsert({
          match_id: match.id,
          client_id: match.client_id,
          owner_id: match.owner_id,
          listing_id: match.listing_id,
          status: 'active'
        });

      if (conversationError) {
        logger.error('[detectAndCreateMatch] Error creating conversation:', conversationError);
      }

      // Get profiles for match celebration with error handling
      try {
        const [clientProfile, ownerProfile] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', match.client_id)
            .single(),
          supabase
            .from('profiles')
            .select('*')
            .eq('id', match.owner_id)
            .single()
        ]);

        // Trigger match celebration
        if (onMatch && clientProfile.data && ownerProfile.data) {
          onMatch(clientProfile.data, ownerProfile.data);
        }

        toast.success("🎉 It's a Match!", {
          description: "You both liked each other!"
        });
      } catch (profileError) {
        logger.error('Error fetching profiles for match:', profileError);
        toast.success("🎉 It's a Match!", {
          description: "You both liked each other!"
        });
      }
    }
  }
}