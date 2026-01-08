import { useQuery, useQueryClient, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * PERFORMANCE: Deferred query hook for "instant first screen" experience
 *
 * Uses requestIdleCallback or setTimeout to defer query execution,
 * allowing the UI shell to render immediately before data fetching begins.
 * This creates Instagram/Tinder-level perceived speed.
 *
 * @param queryKey - React Query key
 * @param queryFn - Query function
 * @param options - Standard React Query options
 * @param deferMs - Milliseconds to defer (default 0 for immediate idle)
 */
export function useDeferredQuery<TData = unknown, TError = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
  deferMs: number = 0
) {
  const [isDeferred, setIsDeferred] = useState(true);

  useEffect(() => {
    // Use requestIdleCallback if available for non-blocking defer
    if ('requestIdleCallback' in window) {
      const handle = (window as Window).requestIdleCallback(
        () => setIsDeferred(false),
        { timeout: deferMs + 1000 }
      );
      return () => (window as Window).cancelIdleCallback(handle);
    } else {
      // Fallback to setTimeout
      const timer = setTimeout(() => setIsDeferred(false), deferMs);
      return () => clearTimeout(timer);
    }
  }, [deferMs]);

  return useQuery({
    queryKey,
    queryFn,
    ...options,
    // Only enable after defer period
    enabled: !isDeferred && (options?.enabled !== false),
  });
}

/**
 * PERFORMANCE: Prefetch critical data immediately after login
 * Call this from auth success handlers to warm the cache
 */
export function usePrefetchAfterLogin() {
  const queryClient = useQueryClient();

  const prefetchCriticalData = useCallback(async (userId: string, role: 'client' | 'owner') => {
    // Prefetch user profile
    queryClient.prefetchQuery({
      queryKey: ['profile', userId],
      queryFn: async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch notifications count
    queryClient.prefetchQuery({
      queryKey: ['notifications-count', userId],
      queryFn: async () => {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false);
        return count || 0;
      },
      staleTime: 30 * 1000,
    });

    // Role-specific prefetch
    if (role === 'client') {
      // Prefetch first batch of listings for swipe
      queryClient.prefetchQuery({
        queryKey: ['smart-listings', {}, 0],
        queryFn: async () => {
          const { data } = await supabase
            .from('listings')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(10);
          return data || [];
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [queryClient]);

  return { prefetchCriticalData };
}
