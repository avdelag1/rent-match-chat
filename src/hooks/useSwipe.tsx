
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { isOffline, queueSwipe } from '@/utils/offlineSwipeQueue';

/**
 * SWIPE LIKE HANDLER (CORRECT ARCHITECTURE)
 *
 * Rules:
 * - Swipe deck = temporary UI
 * - Likes table = permanent truth (for all swipes)
 *   - direction='right' for likes
 *   - direction='left' for dislikes
 * - owner_likes table = for owner -> client likes
 * - Matches = derived, not inferred
 *
 * This hook handles:
 * 1. Client swiping on listings -> INSERT into likes table (target_id = listing.id)
 * 2. Owner swiping on clients -> INSERT into owner_likes table
 * 3. Left swipes -> INSERT into likes table with direction='left'
 */
export function useSwipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetId, direction, targetType = 'listing' }: {
      targetId: string;
      direction: 'left' | 'right';
      targetType?: 'listing' | 'profile';
    }) => {
      // OFFLINE SUPPORT: Queue swipe if offline, sync later
      if (isOffline()) {
        queueSwipe({ targetId, direction, targetType });
        return { success: true, queued: true };
      }

      // OPTIMIZED: Defensive auth check
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        logger.error('[useSwipe] Auth error:', authError);
        throw new Error('Authentication error. Please refresh the page.');
      }
      if (!user?.id) {
        logger.error('[useSwipe] No user found');
        throw new Error('User not authenticated. Please refresh the page.');
      }

      // Handle LEFT swipes (dislikes) - goes to likes table with direction='left'
      if (direction === 'left') {
        const { error: dislikeError } = await supabase
          .from('likes')
          .upsert({
            user_id: user.id,
            target_id: targetId,
            direction: 'left'
          }, {
            onConflict: 'user_id,target_id',
            ignoreDuplicates: false
          });

        if (dislikeError) {
          logger.error('[useSwipe] Dislike error:', dislikeError);
          // Don't throw - dislikes failing shouldn't break the swipe experience
        }

        return { success: true };
      }

      // Handle RIGHT swipes (likes)
      if (targetType === 'listing') {
        // CLIENT -> LISTING like: Use the likes table with target_id
        const { error } = await supabase
          .from('likes')
          .upsert({
            user_id: user.id,
            target_id: targetId,
            direction: 'right'
          }, {
            onConflict: 'user_id,target_id',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          logger.error('[useSwipe] Database error:', error);
          throw error;
        }

        // Notify listing owner
        try {
          const { data: listing } = await supabase
            .from('listings')
            .select('owner_id')
            .eq('id', targetId)
            .maybeSingle();

          if (listing?.owner_id) {
            await supabase.from('notifications').insert([{
              user_id: listing.owner_id,
              type: 'like',
              title: '💚 Someone liked your listing!',
              message: 'You have a new interested client. Check your likes to see them!',
              data: { liker_id: user.id, target_id: targetId, target_type: 'listing' }
            }] as any);

            // Check for mutual match (owner liked this client via owner_likes)
            const { data: ownerLike } = await supabase
              .from('owner_likes')
              .select('*')
              .eq('owner_id', listing.owner_id)
              .eq('client_id', user.id)
              .maybeSingle();

            if (ownerLike) {
              // Create a match
              await createMatch({
                clientId: user.id,
                ownerId: listing.owner_id,
                listingId: targetId,
                clientLikedAt: new Date().toISOString(),
                ownerLikedAt: ownerLike.created_at
              });

              toast({
                title: "It's a Match! 🎉",
                description: "You can now message each other for free!",
              });
            } else {
              toast({
                title: "✨ Liked & Saved!",
                description: "We'll notify you if there's a match.",
              });
            }
          }
        } catch (notifError) {
          logger.error('[useSwipe] Failed to send notification:', notifError);
        }

      } else if (targetType === 'profile') {
        // OWNER -> CLIENT like: Use the owner_likes table
        const { error } = await supabase
          .from('owner_likes')
          .upsert({
            owner_id: user.id,
            client_id: targetId
          }, {
            onConflict: 'owner_id,client_id',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          logger.error('[useSwipe] Owner like error:', error);
          throw error;
        }

        // Notify the client
        try {
          await supabase.from('notifications').insert([{
            user_id: targetId,
            type: 'like',
            title: '💚 An owner liked you!',
            message: 'Someone is interested in you as a tenant!',
            data: { liker_id: user.id, target_id: targetId, target_type: 'profile' }
          }] as any);

          // Check for mutual match (client liked one of owner's listings)
          const { data: clientLikes } = await supabase
            .from('likes')
            .select(`
              id,
              target_id,
              created_at
            `)
            .eq('user_id', targetId)
            .eq('direction', 'right');

          // Get owner's listings
          const { data: ownerListings } = await supabase
            .from('listings')
            .select('id')
            .eq('owner_id', user.id);

          const ownerListingIds = new Set(ownerListings?.map(l => l.id) || []);

          // Find if client liked any listing owned by this user
          const mutualLike = clientLikes?.find(
            (like: any) => ownerListingIds.has(like.target_id)
          );

          if (mutualLike) {
            // Create a match
            await createMatch({
              clientId: targetId,
              ownerId: user.id,
              listingId: mutualLike.target_id,
              clientLikedAt: mutualLike.created_at,
              ownerLikedAt: new Date().toISOString()
            });

            toast({
              title: "It's a Match! 🎉",
              description: "You can now message each other for free!",
            });
          } else {
            toast({
              title: "✨ Liked & Saved!",
              description: "We'll notify you if there's a match.",
            });
          }
        } catch (notifError) {
          logger.error('[useSwipe] Failed to process owner like:', notifError);
        }
      }

      return { success: true };
    },
    onSuccess: (data, variables) => {
      // OFFLINE SUPPORT: Show toast for queued swipes
      if ((data as any)?.queued) {
        if (variables.direction === 'right') {
          toast({
            title: "📱 Saved Offline",
            description: "Your like will sync when you're back online.",
          });
        }
        return; // Don't invalidate queries for queued swipes
      }

      // OPTIMIZED: Only invalidate relevant queries based on swipe type
      const isLike = variables.direction === 'right';

      if (isLike) {
        // Only invalidate like-related queries on like swipes
        // Note: Fire-and-forget - cache invalidation errors are non-critical
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['likes'] }),
          queryClient.invalidateQueries({ queryKey: [variables.targetType === 'listing' ? 'liked-properties' : 'liked-clients'] }),
          queryClient.invalidateQueries({ queryKey: ['matches'] }),
        ]).catch(() => { /* Cache invalidation errors are non-critical */ });
      }
      // Skip invalidations on dislike - no UI changes needed
    },
    onError: (error: any) => {
      logger.error('[useSwipe] Mutation error:', error);
      toast({
        title: 'Error Saving',
        description: error?.message || 'Failed to save your preference. Please try again.',
        variant: 'destructive'
      });
    }
  });
}

/**
 * Helper function to create a match with proper retry logic
 */
async function createMatch({
  clientId,
  ownerId,
  listingId,
  clientLikedAt,
  ownerLikedAt
}: {
  clientId: string;
  ownerId: string;
  listingId: string;
  clientLikedAt: string;
  ownerLikedAt: string;
}) {
  let matchCreated = false;
  let matchData = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const { data, error: matchError } = await supabase
      .from('matches')
      .upsert({
        client_id: clientId,
        owner_id: ownerId,
        listing_id: listingId,
        client_liked_at: clientLikedAt,
        owner_liked_at: ownerLikedAt,
        is_mutual: true,
        status: 'accepted',
        free_messaging: true
      }, {
        onConflict: 'client_id,owner_id,listing_id',
        ignoreDuplicates: true
      })
      .select();

    if (!matchError || matchError.code === '23505') {
      // Success or duplicate key (which is fine)
      matchCreated = true;
      matchData = data;
      break;
    }

    logger.error(`[createMatch] Attempt ${attempt}/3 failed:`, matchError);

    if (attempt < 3) {
      // Exponential backoff: 300ms, 600ms
      await new Promise(resolve => setTimeout(resolve, attempt * 300));
    }
  }

  // Create conversation if match was created
  if (matchCreated) {
    if (!matchData?.[0]) {
      // Fetch existing match if upsert returned empty
      const { data: existingMatch } = await supabase
        .from('matches')
        .select()
        .eq('client_id', clientId)
        .eq('owner_id', ownerId)
        .eq('listing_id', listingId)
        .maybeSingle();

      matchData = existingMatch ? [existingMatch] : null;
    }

    if (matchData?.[0]) {
      await supabase.from('conversations').upsert({
        match_id: matchData[0].id,
        client_id: clientId,
        owner_id: ownerId,
        listing_id: listingId,
        status: 'active',
        free_messaging: true
      }, {
        onConflict: 'client_id,owner_id',
        ignoreDuplicates: true
      });
    }
  }

  return { matchCreated, matchData };
}
