
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

      // Check if already swiped to prevent duplicate errors
      const { data: existingSwipe } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.user.id)
        .eq('target_id', targetId)
        .single();

      if (existingSwipe) {
        console.log('Already swiped on this target, skipping...');
        return { alreadySwiped: true };
      }

      // Use the likes table for both listings and profiles
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

      console.log('Like inserted successfully');
      
      // Check if this creates a match (both users liked each other)
      if (direction === 'right') {
        if (targetType === 'listing') {
          // Get the listing owner
          const { data: listing } = await supabase
            .from('listings')
            .select('owner_id')
            .eq('id', targetId)
            .single();

          if (listing) {
            // Check if owner also liked this client
            const { data: ownerLike } = await supabase
              .from('likes')
              .select('*')
              .eq('user_id', listing.owner_id)
              .eq('target_id', user.user.id)
              .eq('direction', 'right')
              .single();

            if (ownerLike) {
              // Create a match!
              await supabase.from('matches').insert({
                client_id: user.user.id,
                owner_id: listing.owner_id,
                listing_id: targetId,
                client_liked_at: new Date().toISOString(),
                owner_liked_at: ownerLike.created_at,
                is_mutual: true,
                status: 'accepted'
              });

              toast({
                title: "It's a Match! 🎉",
                description: "You and the client both liked each other!",
              });
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
            .single();

          if (clientLike) {
            // Create a match!
            await supabase.from('matches').insert({
              client_id: targetId,
              owner_id: user.user.id,
              client_liked_at: clientLike.created_at,
              owner_liked_at: new Date().toISOString(),
              is_mutual: true,
              status: 'accepted'
            });

            toast({
              title: "It's a Match! 🎉",
              description: "You and the client both liked each other!",
            });
          }
        }
      }
    },
    onSuccess: () => {
      console.log('Swipe successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['liked-properties'] });
      queryClient.invalidateQueries({ queryKey: ['owner-swipes'] });
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
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
