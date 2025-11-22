
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { retryWithBackoff, PG_ERROR_CODES } from '@/utils/retryUtils';

export function useSwipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetId, direction, targetType = 'listing' }: {
      targetId: string;
      direction: 'left' | 'right';
      targetType?: 'listing' | 'profile';
    }) => {
      console.log('[useSwipe] Starting swipe mutation:', { targetId, direction, targetType });

      // OPTIMIZED: Defensive auth check
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('[useSwipe] Auth error:', authError);
        throw new Error('Authentication error. Please refresh the page.');
      }
      if (!user?.id) {
        console.error('[useSwipe] No user found');
        throw new Error('User not authenticated. Please refresh the page.');
      }

      console.log('[useSwipe] User authenticated:', user.id);

      // Use atomic upsert to prevent race conditions
      const { data: likeData, error } = await supabase
        .from('likes')
        .upsert({
          user_id: user.id,
          target_id: targetId,
          direction: direction
        }, {
          onConflict: 'user_id,target_id,direction',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('[useSwipe] Database error:', error);
        throw error;
      }

      console.log('[useSwipe] Like saved successfully:', likeData);
      
      // Send notification to the liked user (for right swipes)
      if (direction === 'right') {
        try {
          let recipientId: string | null = null;
          
          if (targetType === 'listing') {
            const { data: listing } = await supabase
              .from('listings')
              .select('owner_id')
              .eq('id', targetId)
              .maybeSingle();
            recipientId = listing?.owner_id || null;
          } else {
            recipientId = targetId;
          }
          
          if (recipientId) {
            await supabase.from('notifications').insert([{
              user_id: recipientId,
              type: 'like',
              title: '💚 Someone liked you!',
              message: 'You have a new like. Swipe to see if it\'s a match!',
              data: { liker_id: user.id, target_id: targetId, target_type: targetType }
            }] as any);
          }
        } catch (notifError) {
          console.error('[useSwipe] Failed to send notification:', notifError);
        }
      }
      
      // Check if this creates a match (both users liked each other)
      // Wrap in try-catch to prevent match detection errors from failing the entire swipe
      if (direction === 'right') {
        try {
          if (targetType === 'listing') {
            // Get the listing owner
            const { data: listing } = await supabase
              .from('listings')
              .select('owner_id')
              .eq('id', targetId)
              .maybeSingle();

            if (listing) {
              // Check if owner also liked this client
              const { data: ownerLike } = await supabase
                .from('likes')
                .select('*')
                .eq('user_id', listing.owner_id)
                .eq('target_id', user.id)
                .eq('direction', 'right')
                .maybeSingle();

            if (ownerLike) {
              // Create a match with proper conflict handling and retry logic
              let matchCreated = false;
              let matchData = null;
              
              for (let attempt = 1; attempt <= 3; attempt++) {
                const { data, error: matchError } = await supabase
                  .from('matches')
                  .upsert({
                    client_id: user.id,
                    owner_id: listing.owner_id,
                    listing_id: targetId,
                    client_liked_at: new Date().toISOString(),
                    owner_liked_at: ownerLike.created_at,
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

                console.error(`[useSwipe] Match creation attempt ${attempt}/3 failed:`, matchError);
                
                if (attempt < 3) {
                  // Exponential backoff: 300ms, 600ms
                  await new Promise(resolve => setTimeout(resolve, attempt * 300));
                }
              }

              // Only show match notification if match was created or already exists
              if (matchCreated) {
                // If data is empty, match already existed - fetch it
                if (!matchData?.[0]) {
                  const { data: existingMatch } = await supabase
                    .from('matches')
                    .select()
                    .eq('client_id', user.id)
                    .eq('owner_id', listing.owner_id)
                    .eq('listing_id', targetId)
                    .maybeSingle();
                  
                  matchData = existingMatch ? [existingMatch] : null;
                }
                
                if (matchData?.[0]) {
                  // Create conversation for free messaging
                  await supabase.from('conversations').upsert({
                    match_id: matchData[0].id,
                    client_id: user.id,
                    owner_id: listing.owner_id,
                    listing_id: targetId,
                    status: 'active',
                    free_messaging: true
                  }, {
                    onConflict: 'client_id,owner_id',
                    ignoreDuplicates: true
                  });
                  
                  toast({
                    title: "It's a Match! 🎉",
                    description: "You can now message each other for free!",
                  });
                }
              }
            } else {
              // No mutual match yet, just show that we saved the like
              toast({
                title: "✨ Liked & Saved!",
                description: "We'll notify you if there's a match.",
              });
            }
            }
          } else if (targetType === 'profile') {
            // Check if the client also liked this owner (owner is swiping on client profiles)
            const { data: clientLike } = await supabase
              .from('likes')
              .select('*')
              .eq('user_id', targetId)
              .eq('target_id', user.id)
              .eq('direction', 'right')
              .maybeSingle();

            if (clientLike) {
              // Create a match with proper conflict handling and retry logic
              let matchCreated = false;
              let matchData = null;
              
              for (let attempt = 1; attempt <= 3; attempt++) {
                const { data, error: matchError } = await supabase
                  .from('matches')
                  .upsert({
                    client_id: targetId,
                    owner_id: user.id,
                    listing_id: null,
                    client_liked_at: clientLike.created_at,
                    owner_liked_at: new Date().toISOString(),
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

                console.error(`[useSwipe] Match creation attempt ${attempt}/3 failed:`, matchError);
                
                if (attempt < 3) {
                  // Exponential backoff: 300ms, 600ms
                  await new Promise(resolve => setTimeout(resolve, attempt * 300));
                }
              }

              // Only show match notification if match was created or already exists
              if (matchCreated) {
                // If data is empty, match already existed - fetch it
                if (!matchData?.[0]) {
                  const { data: existingMatch } = await supabase
                    .from('matches')
                    .select()
                    .eq('client_id', targetId)
                    .eq('owner_id', user.id)
                    .is('listing_id', null)
                    .maybeSingle();
                  
                  matchData = existingMatch ? [existingMatch] : null;
                }
                
                if (matchData?.[0]) {
                  // Create conversation for free messaging
                  await supabase.from('conversations').upsert({
                    match_id: matchData[0].id,
                    client_id: targetId,
                    owner_id: user.id,
                    listing_id: null,
                    status: 'active',
                    free_messaging: true
                  }, {
                    onConflict: 'client_id,owner_id',
                    ignoreDuplicates: true
                  });
                  
                  toast({
                    title: "It's a Match! 🎉",
                    description: "You can now message each other for free!",
                  });
                }
              }
            } else {
              // No mutual match yet, just show that we saved the like
              toast({
                title: "✨ Liked & Saved!",
                description: "We'll notify you if there's a match.",
              });
            }
          }
        } catch (matchError) {
          // Match detection errors don't fail the entire swipe
        }
      }

      return { success: true };
    },
    onSuccess: (data, variables) => {
      // OPTIMIZED: Only invalidate relevant queries based on swipe type
      const isLike = variables.swipeType === 'like' || variables.swipeType === 'super_like';

      if (isLike) {
        // Only invalidate like-related queries on like swipes
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['likes'] }),
          queryClient.invalidateQueries({ queryKey: [variables.targetType === 'property' ? 'liked-properties' : 'liked-clients'] }),
          queryClient.invalidateQueries({ queryKey: ['matches'] }),
        ]);
      }
      // Skip invalidations on dislike - no UI changes needed
    },
    onError: (error: any) => {
      console.error('[useSwipe] Mutation error:', error);
      toast({
        title: 'Error Saving',
        description: error?.message || 'Failed to save your preference. Please try again.',
        variant: 'destructive'
      });
    }
  });
}
