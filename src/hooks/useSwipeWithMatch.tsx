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
        // Owner swiping on a client profile - save to owner_likes table
        if (direction === 'right') {
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
          // For left swipes, we don't need to save anything special
          // Just return early with a placeholder
          like = { id: 'skipped', direction };
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

      // If it's a right swipe, check for mutual likes
      if (direction === 'right') {
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
            return like;
          }

          matchClientId = user.id;  // Current user is the client
          matchOwnerId = listing.owner_id;  // Listing owner
          matchListingId = targetId;  // The listing

          // Check if owner liked this client (in owner_likes table)
          const { data: ownerLike } = await supabase
            .from('owner_likes')
            .select('*')
            .eq('owner_id', listing.owner_id)
            .eq('client_id', user.id)
            .maybeSingle();

          mutualLike = ownerLike;
        } else {
          // Owner swiping on a client profile
          matchClientId = targetId;  // Target is the client
          matchOwnerId = user.id;  // Current user is the owner

          // Get owner's listings to check if client liked any of them
          const { data: ownerListings } = await supabase
            .from('listings')
            .select('id')
            .eq('owner_id', user.id);

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
                client_liked_at: targetType === 'profile' ? mutualLike.created_at : like.created_at,
                owner_liked_at: targetType === 'profile' ? like.created_at : mutualLike.created_at,
                status: 'accepted'
              }, {
                onConflict: 'client_id,owner_id,listing_id',
                ignoreDuplicates: true
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

            logger.error(`[useSwipeWithMatch] Match creation attempt ${attempt}/3 failed:`, matchError);
            
            if (attempt < 3) {
              // Exponential backoff: 300ms, 600ms
              await new Promise(resolve => setTimeout(resolve, attempt * 300));
            }
          }

          if (!matchCreated) {
            logger.error('[useSwipeWithMatch] Failed to create match after 3 attempts');
            toast.error("Match creation failed. Please try again.");
          } else if (match) {
            // Create conversation explicitly after match is created
            const { error: conversationError } = await supabase
              .from('conversations')
              .upsert({
                match_id: match.id,
                client_id: match.client_id,
                owner_id: match.owner_id,
                listing_id: match.listing_id,
                status: 'active'
              }, {
                onConflict: 'client_id,owner_id',
                ignoreDuplicates: true
              });

            if (conversationError) {
              logger.error('[useSwipeWithMatch] Error creating conversation:', conversationError);
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
              if (options?.onMatch && clientProfile.data && ownerProfile.data) {
                options.onMatch(clientProfile.data, ownerProfile.data);
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

      return like;
    },
  onSuccess: () => {
      // Invalidate relevant queries for instant UI updates
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['owner-likes'] });
      queryClient.invalidateQueries({ queryKey: ['liked-properties'] });
      queryClient.invalidateQueries({ queryKey: ['liked-clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: (error) => {
      logger.error('Swipe error:', error);
      toast.error("Something went wrong. Please try again.");
    }
  });
}