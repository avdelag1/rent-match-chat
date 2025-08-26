
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

      const { error } = await supabase
        .from('swipes')
        .insert({
          user_id: user.user.id,
          target_id: targetId,
          target_type: targetType,
          direction
        });

      if (error) throw error;

      // Check if this creates a match (both users liked each other)
      if (direction === 'right' && targetType === 'listing') {
        // Get the listing owner
        const { data: listing } = await supabase
          .from('listings')
          .select('owner_id')
          .eq('id', targetId)
          .single();

        if (listing) {
          // Check if owner also liked this client
          const { data: ownerSwipe } = await supabase
            .from('swipes')
            .select('*')
            .eq('user_id', listing.owner_id)
            .eq('target_id', user.user.id)
            .eq('target_type', 'profile')
            .eq('direction', 'right')
            .single();

          if (ownerSwipe) {
            // Create a match!
            await supabase.from('matches').insert({
              client_id: user.user.id,
              owner_id: listing.owner_id,
              listing_id: targetId,
              client_liked_at: new Date().toISOString(),
              owner_liked_at: ownerSwipe.created_at,
              is_mutual: true,
              status: 'accepted'
            });

            toast({
              title: "It's a Match! 🎉",
              description: "You and the owner both liked each other!",
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swipes'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
