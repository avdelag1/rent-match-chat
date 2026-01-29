import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

/**
 * SIMPLE SWIPE LIKE HANDLER
 * 
 * Uses the unified `likes` table with direction column:
 * - Left swipe = direction: 'left' (dislike)
 * - Right swipe = direction: 'right' (like)
 * 
 * Schema: likes(id, user_id, target_id, target_type, direction, created_at)
 */
export function useSwipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetId, direction, targetType = 'listing' }: {
      targetId: string;
      direction: 'left' | 'right';
      targetType?: 'listing' | 'profile';
    }) => {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user?.id) {
        throw new Error('Not authenticated');
      }

      // Save swipe to likes table with direction
      const { error } = await supabase
        .from('likes')
        .upsert({
          user_id: user.id,
          target_id: targetId,
          target_type: targetType,
          direction: direction
        }, {
          onConflict: 'user_id,target_id',
          ignoreDuplicates: false
        });

      if (error) {
        logger.error('[useSwipe] Error saving swipe:', error);
        throw error;
      }

      return { success: true, direction, targetId };
    },
    onSuccess: (data) => {
      // Invalidate likes cache so saved list updates
      queryClient.invalidateQueries({ queryKey: ['liked-properties'] }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['liked-clients'] }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['matches'] }).catch(() => {});
    },
    onError: (error: any) => {
      logger.error('[useSwipe] Error:', error);
      toast({
        title: 'Error Saving',
        description: error?.message || 'Could not save. Please try again.',
        variant: 'destructive'
      });
    }
  });
}
