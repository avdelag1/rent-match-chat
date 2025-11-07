
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PG_ERROR_CODES, sleep } from '@/utils/retryUtils';

export function useSwipe() {
  const queryClient = useQueryClient();

  // Helper function to create conversation with retry logic
  const createConversation = async (
    matchId: string,
    clientId: string,
    ownerId: string,
    listingId: string | null
  ) => {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        await supabase.from('conversations').upsert({
          match_id: matchId,
          client_id: clientId,
          owner_id: ownerId,
          listing_id: listingId,
          status: 'active',
          free_messaging: true
        }, {
          onConflict: 'client_id,owner_id',
          ignoreDuplicates: true
        });
        return; // Success
      } catch (error) {
        retryCount++;
        console.warn(`[useSwipe] Conversation creation attempt ${retryCount} failed:`, error);
        if (retryCount < maxRetries) {
          await sleep(retryCount * 300);
        }
      }
    }
    console.error('[useSwipe] Failed to create conversation after retries');
  };

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
          direction
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
      
      // Send notification to the liked user
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
              title: 'Someone liked you!',
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
              // Create a match with proper conflict handling using transaction-like approach
              // First, check if match already exists to avoid duplicate key errors
              const { data: existingMatch } = await supabase
                .from('matches')
                .select('id')
                .eq('client_id', user.id)
                .eq('owner_id', listing.owner_id)
                .eq('listing_id', targetId)
                .maybeSingle();

              if (!existingMatch) {
                const { data: matchData, error: matchError } = await supabase
                  .from('matches')
                  .insert({
                    client_id: user.id,
                    owner_id: listing.owner_id,
                    listing_id: targetId,
                    client_liked_at: new Date().toISOString(),
                    owner_liked_at: ownerLike.created_at,
                    is_mutual: true,
                    status: 'accepted',
                    free_messaging: true
                  })
                  .select()
                  .single();

                // Handle duplicate key violation gracefully
                if (matchError) {
                  if (matchError.code === PG_ERROR_CODES.DUPLICATE_KEY) {
                    // Duplicate key - match was created by another request
                    console.log('[useSwipe] Match already exists (race condition), fetching existing match');
                    const { data: fetchedMatch } = await supabase
                      .from('matches')
                      .select('id')
                      .eq('client_id', user.id)
                      .eq('owner_id', listing.owner_id)
                      .eq('listing_id', targetId)
                      .single();
                    
                    if (fetchedMatch) {
                      // Use the existing match for conversation
                      await createConversation(fetchedMatch.id, user.id, listing.owner_id, targetId);
                    }
                  } else {
                    console.error('[useSwipe] Unexpected match creation error:', matchError);
                  }
                } else if (matchData) {
                  // Successfully created new match
                  await createConversation(matchData.id, user.id, listing.owner_id, targetId);
                  
                  toast({
                    title: "It's a Match! 🎉",
                    description: "You can now message each other for free!",
                  });
                }
              } else {
                // Match already exists, ensure conversation exists
                await createConversation(existingMatch.id, user.id, listing.owner_id, targetId);
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
              // Create a match with proper conflict handling
              const { data: existingMatch } = await supabase
                .from('matches')
                .select('id')
                .eq('client_id', targetId)
                .eq('owner_id', user.id)
                .eq('listing_id', null)
                .maybeSingle();

              if (!existingMatch) {
                const { data: matchData, error: matchError } = await supabase
                  .from('matches')
                  .insert({
                    client_id: targetId,
                    owner_id: user.id,
                    listing_id: null,
                    client_liked_at: clientLike.created_at,
                    owner_liked_at: new Date().toISOString(),
                    is_mutual: true,
                    status: 'accepted',
                    free_messaging: true
                  })
                  .select()
                  .single();

                // Handle duplicate key violation gracefully
                if (matchError) {
                  if (matchError.code === PG_ERROR_CODES.DUPLICATE_KEY) {
                    console.log('[useSwipe] Profile match already exists, fetching existing');
                    const { data: fetchedMatch } = await supabase
                      .from('matches')
                      .select('id')
                      .eq('client_id', targetId)
                      .eq('owner_id', user.id)
                      .maybeSingle();
                    
                    if (fetchedMatch) {
                      await createConversation(fetchedMatch.id, targetId, user.id, null);
                    }
                  } else {
                    console.error('[useSwipe] Unexpected profile match error:', matchError);
                  }
                } else if (matchData) {
                  await createConversation(matchData.id, targetId, user.id, null);
                  
                  toast({
                    title: "It's a Match! 🎉",
                    description: "You can now message each other for free!",
                  });
                }
              } else {
                await createConversation(existingMatch.id, targetId, user.id, null);
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
    onSuccess: () => {
      // OPTIMIZED: Batch invalidate queries for better performance
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['liked-properties'] });
      queryClient.invalidateQueries({ queryKey: ['liked-clients'] });
      queryClient.invalidateQueries({ queryKey: ['owner-swipes'] });
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
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
