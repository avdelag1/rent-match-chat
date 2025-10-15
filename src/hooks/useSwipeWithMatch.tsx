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
      if (!user?.id) throw new Error('User not authenticated');

      // Insert the swipe/like
      const { data: like, error: likeError } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          target_id: targetId,
          direction
        })
        .select()
        .single();

      if (likeError) throw likeError;

      // If it's a right swipe, check for mutual likes
      if (direction === 'right') {
        // Check if the target user also liked this user
        const { data: mutualLike } = await supabase
          .from('likes')
          .select('*')
          .eq('user_id', targetId)
          .eq('target_id', user.id)
          .eq('direction', 'right')
          .single();

        if (mutualLike) {
          // It's a match! Create or update match record with proper conflict handling
          const { data: match, error: matchError } = await supabase
            .from('matches')
            .upsert({
              client_id: targetType === 'profile' ? targetId : user.id,
              owner_id: targetType === 'profile' ? user.id : targetId,
              is_mutual: true,
              client_liked_at: targetType === 'profile' ? mutualLike.created_at : like.created_at,
              owner_liked_at: targetType === 'profile' ? like.created_at : mutualLike.created_at,
              status: 'accepted'
            }, {
              onConflict: 'client_id,owner_id',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (matchError) {
            console.error('Error creating match:', matchError);
            toast.error("Match creation failed. Please try again.");
          } else if (match) {
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
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['liked-properties'] });
      queryClient.invalidateQueries({ queryKey: ['liked-clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (error) => {
      console.error('Swipe error:', error);
      toast.error("Something went wrong. Please try again.");
    }
  });
}