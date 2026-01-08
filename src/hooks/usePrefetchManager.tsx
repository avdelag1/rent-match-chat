import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Prefetch Manager Hook
 * 
 * Implements React Query prefetchQuery() for:
 * - Next swipe batch when user reaches card index 2-3
 * - Next page for infinite lists when near end
 * - Likely conversation messages when entering messaging
 */
export function usePrefetchManager() {
  const queryClient = useQueryClient();
  const prefetchedKeys = useRef<Set<string>>(new Set());

  /**
   * Prefetch next batch of listings for swipe deck
   * Called when user reaches card index 2-3 of current batch
   */
  const prefetchNextSwipeBatch = useCallback(async (
    currentPage: number,
    filters?: Record<string, unknown>
  ) => {
    const key = `swipe-batch-${currentPage + 1}`;
    if (prefetchedKeys.current.has(key)) return;
    
    prefetchedKeys.current.add(key);

    await queryClient.prefetchQuery({
      queryKey: ['smart-listings', filters, currentPage + 1],
      queryFn: async () => {
        const { data } = await supabase
          .from('listings')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .range((currentPage + 1) * 10, (currentPage + 2) * 10 - 1);
        return data || [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient]);

  /**
   * Prefetch conversation messages for likely-to-open threads
   * Called when user enters messaging dashboard
   */
  const prefetchTopConversationMessages = useCallback(async (
    conversationId: string
  ) => {
    const key = `messages-${conversationId}`;
    if (prefetchedKeys.current.has(key)) return;
    
    prefetchedKeys.current.add(key);

    await queryClient.prefetchQuery({
      queryKey: ['conversation-messages', conversationId],
      queryFn: async () => {
        const { data } = await supabase
          .from('conversation_messages')
          .select(`
            id,
            conversation_id,
            sender_id,
            message_text,
            message_type,
            created_at,
            is_read,
            sender:profiles!conversation_messages_sender_id_fkey(
              id, full_name, avatar_url
            )
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
          .limit(50);
        return data || [];
      },
      staleTime: 30 * 1000, // 30 seconds for messages
    });
  }, [queryClient]);

  /**
   * Prefetch next page of notifications
   */
  const prefetchNextNotificationsPage = useCallback(async (
    userId: string,
    offset: number
  ) => {
    const key = `notifications-${offset}`;
    if (prefetchedKeys.current.has(key)) return;
    
    prefetchedKeys.current.add(key);

    await queryClient.prefetchQuery({
      queryKey: ['notifications', userId, offset],
      queryFn: async () => {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + 49);
        return data || [];
      },
      staleTime: 60 * 1000, // 1 minute
    });
  }, [queryClient]);

  /**
   * Clear prefetch cache when navigating away
   */
  const clearPrefetchCache = useCallback(() => {
    prefetchedKeys.current.clear();
  }, []);

  return {
    prefetchNextSwipeBatch,
    prefetchTopConversationMessages,
    prefetchNextNotificationsPage,
    clearPrefetchCache,
  };
}

/**
 * Hook to automatically prefetch swipe batch when near end
 */
export function useSwipePrefetch(
  currentIndex: number,
  currentPage: number,
  totalInBatch: number,
  filters?: Record<string, unknown>
) {
  const { prefetchNextSwipeBatch } = usePrefetchManager();

  useEffect(() => {
    // Prefetch next batch when user reaches card 2-3 of current batch
    // or when remaining cards in batch is less than 5
    const remainingInBatch = totalInBatch - (currentIndex % 10);
    
    if (remainingInBatch <= 5 && remainingInBatch > 0) {
      // Use requestIdleCallback to avoid blocking UI
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          prefetchNextSwipeBatch(currentPage, filters);
        }, { timeout: 2000 });
      } else {
        setTimeout(() => {
          prefetchNextSwipeBatch(currentPage, filters);
        }, 100);
      }
    }
  }, [currentIndex, currentPage, totalInBatch, filters, prefetchNextSwipeBatch]);
}
