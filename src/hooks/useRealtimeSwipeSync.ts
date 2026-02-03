import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Subscribes to real-time INSERT / UPDATE events on `listings` (client role)
 * or `profiles` (owner role) and invalidates the matching React Query cache.
 *
 * This keeps swipe cards in sync when any user creates or edits a listing /
 * profile — no manual refresh required.
 *
 * @param role
 *   - 'client'  → watches the `listings` table, invalidates `smart-listings`
 *   - 'owner'   → watches the `profiles`  table, invalidates `smart-clients`
 */
export function useRealtimeSwipeSync(role: 'client' | 'owner') {
  const queryClient = useQueryClient();
  // Unique channel name per hook instance so multiple mounts don't collide
  const idRef = useRef(`${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

  useEffect(() => {
    const table    = role === 'client' ? 'listings' : 'profiles';
    const queryKey = role === 'client' ? ['smart-listings'] : ['smart-clients'];

    const channel = supabase
      .channel(`swipe-sync-${idRef.current}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table },
        (payload: any) => {
          // For listings only invalidate when the row is (or became) active
          if (role === 'client') {
            if (payload.new?.status === 'active') {
              queryClient.invalidateQueries({ queryKey });
            }
          } else {
            queryClient.invalidateQueries({ queryKey });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [role, queryClient]);
}
