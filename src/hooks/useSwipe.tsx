
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
              // Create a match with proper conflict handling!
              const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .upsert({
                  client_id: user.id,
                  owner_id: listing.owner_id,
                  listing_id: targetId,
                  client_liked_at: new Date().toISOString(),
                  owner_liked_at: ownerLike.created_at,
                  is_mutual: true,
                  status: 'accepted'
                }, {
                  onConflict: 'client_id,owner_id,listing_id',
                  ignoreDuplicates: true
                })
                .select();

              // Only show match notification if no error
              if (!matchError) {
                toast({
                  title: "It's a Match! 🎉",
                  description: "You and the owner both liked each other!",
                });
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
              // Create a match with proper conflict handling!
              const { data: matchData, error: matchError } = await supabase
                .from('matches')
                .upsert({
                  client_id: targetId,
                  owner_id: user.id,
                  listing_id: null,
                  client_liked_at: clientLike.created_at,
                  owner_liked_at: new Date().toISOString(),
                  is_mutual: true,
                  status: 'accepted'
                }, {
                  onConflict: 'client_id,owner_id,listing_id',
                  ignoreDuplicates: true
                })
                .select();

              // Only show match notification if no error
              if (!matchError) {
                toast({
                  title: "It's a Match! 🎉",
                  description: "You and the client both liked each other!",
                });
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
