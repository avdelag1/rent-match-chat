import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
        console.error('Auth check failed:', { currentUser: currentUser?.id, user: user?.id });
        throw new Error('User not authenticated. Please refresh the page.');
      }

      console.log('Swipe with match auth check passed:', { userId: currentUser.id, targetId, direction });

      // Use atomic upsert to prevent race conditions
      const { data: like, error: likeError } = await supabase
        .from('likes')
        .upsert({
          user_id: user.id,
          target_id: targetId,
          direction
        }, {
          onConflict: 'user_id,target_id,direction',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (likeError) {
        console.error('Error saving like:', likeError);
        throw likeError;
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
            console.error('Listing not found');
            return like;
          }

          matchClientId = user.id;  // Current user is the client
          matchOwnerId = listing.owner_id;  // Listing owner
          matchListingId = targetId;  // The listing

          // Check if owner liked this client
          const { data: ownerLike } = await supabase
            .from('likes')
            .select('*')
            .eq('user_id', listing.owner_id)
            .eq('target_id', user.id)
            .eq('direction', 'right')
            .maybeSingle();

          mutualLike = ownerLike;
        } else {
          // Owner swiping on a client profile
          matchClientId = targetId;  // Target is the client
          matchOwnerId = user.id;  // Current user is the owner
          matchListingId = null;  // No specific listing

          // Check if client liked this owner
          const { data: clientLike } = await supabase
            .from('likes')
            .select('*')
            .eq('user_id', targetId)
            .eq('target_id', user.id)
            .eq('direction', 'right')
            .maybeSingle();

          mutualLike = clientLike;
        }

        if (mutualLike) {
          // It's a match! Create or update match record with proper race condition handling
          // First check if match already exists
          const { data: existingMatch } = await supabase
            .from('matches')
            .select('id, client_id, owner_id, listing_id')
            .eq('client_id', matchClientId)
            .eq('owner_id', matchOwnerId)
            .eq('listing_id', matchListingId)
            .maybeSingle();

          let match = existingMatch;

          if (!existingMatch) {
            // Try to create new match
            const { data: newMatch, error: matchError } = await supabase
              .from('matches')
              .insert({
                client_id: matchClientId,
                owner_id: matchOwnerId,
                listing_id: matchListingId,
                is_mutual: true,
                client_liked_at: targetType === 'profile' ? mutualLike.created_at : like.created_at,
                owner_liked_at: targetType === 'profile' ? like.created_at : mutualLike.created_at,
                status: 'accepted'
              })
              .select()
              .single();

            if (matchError) {
              // Handle duplicate key violation from race condition
              if (matchError.code === '23505') {
                console.log('[useSwipeWithMatch] Match already exists (race condition), fetching');
                const { data: fetchedMatch } = await supabase
                  .from('matches')
                  .select('id, client_id, owner_id, listing_id')
                  .eq('client_id', matchClientId)
                  .eq('owner_id', matchOwnerId)
                  .eq('listing_id', matchListingId)
                  .maybeSingle();
                
                match = fetchedMatch || null;
              } else {
                console.error('Error creating match:', matchError);
                toast.error("Match creation failed. Please try again.");
              }
            } else {
              match = newMatch;
            }
          }

          if (match) {
            // Create conversation with retry logic
            let conversationError = null;
            for (let attempt = 1; attempt <= 3; attempt++) {
              const { error } = await supabase
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

              if (!error) {
                conversationError = null;
                break;
              }

              conversationError = error;
              console.warn(`[useSwipeWithMatch] Conversation creation attempt ${attempt} failed:`, error);
              if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, attempt * 300));
              }
            }

            if (conversationError) {
              console.error('Error creating conversation after retries:', conversationError);
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
              console.error('Error fetching profiles for match:', profileError);
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
      queryClient.invalidateQueries({ queryKey: ['liked-properties'] });
      queryClient.invalidateQueries({ queryKey: ['liked-clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: (error) => {
      console.error('Swipe error:', error);
      toast.error("Something went wrong. Please try again.");
    }
  });
}