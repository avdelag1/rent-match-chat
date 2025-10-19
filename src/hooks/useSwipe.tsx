
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
      // Defensive auth check
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        console.error('Auth check failed - user not authenticated');
        throw new Error('User not authenticated. Please refresh the page.');
      }

      console.log('Swipe auth check passed:', { userId: user.id, targetId, direction, targetType });

      // Use atomic upsert to prevent race conditions
      const { error } = await supabase
        .from('likes')
        .upsert({
          user_id: user.id,
          target_id: targetId,
          direction
        }, {
          onConflict: 'user_id,target_id,direction',
          ignoreDuplicates: true
        });

      if (error) {
        console.error('Error saving like:', error);
        throw error;
      }

      console.log('Like saved successfully');
      
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
                const { error: matchError } = await supabase.from('matches').upsert({
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
                });

                if (matchError) {
                  console.error('Match creation error:', matchError);
                  toast({
                    title: "Match Error",
                    description: "Match created but couldn't be saved. Please refresh.",
                    variant: 'destructive'
                  });
                } else {
                  toast({
                    title: "It's a Match! 🎉",
                    description: "You and the owner both liked each other!",
                  });
                }
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
              const { error: matchError } = await supabase.from('matches').upsert({
                client_id: targetId,
                owner_id: user.id,
                client_liked_at: clientLike.created_at,
                owner_liked_at: new Date().toISOString(),
                is_mutual: true,
                status: 'accepted'
              }, {
                onConflict: 'client_id,owner_id',
                ignoreDuplicates: true
              });

              if (matchError) {
                console.error('Match creation error:', matchError);
                toast({
                  title: "Match Error",
                  description: "Match created but couldn't be saved. Please refresh.",
                  variant: 'destructive'
                });
              } else {
                toast({
                  title: "It's a Match! 🎉",
                  description: "You and the client both liked each other!",
                });
              }
            }
          }
        } catch (matchError) {
          // Log match detection errors but don't fail the entire swipe
          console.error('Match detection error (non-critical):', matchError);
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      console.log('Swipe successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['liked-properties'] });
      queryClient.invalidateQueries({ queryKey: ['liked-clients'] });
      queryClient.invalidateQueries({ queryKey: ['owner-swipes'] });
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
    onError: (error) => {
      console.error('Swipe failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to record your preference. Please try again.',
        variant: 'destructive'
      });
    }
  });
}
