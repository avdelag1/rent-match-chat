import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

/**
 * SIMPLE SWIPE LIKE HANDLER
 * 
 * Simple and reliable - no complex logic
 * - Left swipe = save dismissal (for undo)
 * - Right swipe = save like immediately
 * - No .select() on upsert (prevents connection issues)
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

      // SWIPE LEFT = Save dismissal for undo
      if (direction === 'left') {
        const { error } = await supabase
          .from('swipe_dismissals')
          .upsert({
            user_id: user.id,
            target_id: targetId,
            target_type: targetType === 'listing' ? 'listing' : 'client'
          }, {
            onConflict: 'user_id,target_id,target_type',
            ignoreDuplicates: false
          });

        if (error) {
          logger.error('[useSwipe] Dismissal error:', error);
        }
        return { success: true, direction: 'left', targetId };
      }

      // SWIPE RIGHT = Save like
      if (targetType === 'listing') {
        // Client likes listing - use likes table
        const { error } = await supabase
          .from('likes')
          .upsert({
            user_id: user.id,
            target_listing_id: targetId
          }, {
            onConflict: 'user_id,target_listing_id',
            ignoreDuplicates: false
          });

        if (error) {
          logger.error('[useSwipe] Like error:', error);
          throw error;
        }
      } else {
        // Owner likes client - use owner_likes table
        const { error } = await supabase
          .from('owner_likes')
          .upsert({
            owner_id: user.id,
            client_id: targetId
          }, {
            onConflict: 'owner_id,client_id',
            ignoreDuplicates: false
          });

        if (error) {
          logger.error('[useSwipe] Owner like error:', error);
          throw error;
        }
      }

      return { success: true, direction: 'right', targetId };
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
