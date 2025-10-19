
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      console.log('Swiping:', { targetId, direction, targetType, userId: user.user.id });

      // Check if user has already swiped on this target to prevent duplicates
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('target_id', targetId)
        .maybeSingle();

      if (existingLike) {
        // Update existing like instead of creating new one
        const { error } = await supabase
          .from('likes')
          .update({ direction })
          .eq('id', existingLike.id);

        if (error) {
          console.error('Error updating like:', error);
          throw error;
        }
      } else {
        // Create new like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.user.id,
            target_id: targetId,
            direction
          });

        if (error) {
          console.error('Error inserting like:', error);
          throw error;
        }
      }

      console.log('Like saved successfully');
      
      // Check if this creates a match (both users liked each other)
      if (direction === 'right') {
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
              .eq('target_id', user.user.id)
              .eq('direction', 'right')
              .maybeSingle();

            if (ownerLike) {
              // Create a match with proper conflict handling!
              const { error: matchError } = await supabase.from('matches').upsert({
                client_id: user.user.id,
                owner_id: listing.owner_id,
                listing_id: targetId,
                client_liked_at: new Date().toISOString(),
                owner_liked_at: ownerLike.created_at,
                is_mutual: true,
                status: 'accepted'
              }, {
                onConflict: 'client_id,owner_id',
                ignoreDuplicates: false
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
            .eq('target_id', user.user.id)
            .eq('direction', 'right')
            .maybeSingle();

          if (clientLike) {
            // Create a match with proper conflict handling!
            const { error: matchError } = await supabase.from('matches').upsert({
              client_id: targetId,
              owner_id: user.user.id,
              client_liked_at: clientLike.created_at,
              owner_liked_at: new Date().toISOString(),
              is_mutual: true,
              status: 'accepted'
            }, {
              onConflict: 'client_id,owner_id',
              ignoreDuplicates: false
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
