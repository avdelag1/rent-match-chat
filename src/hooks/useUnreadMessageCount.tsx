import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef } from 'react';

export function useUnreadMessageCount() {
  const { user } = useAuth();
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const query = useQuery({
    queryKey: ['unread-message-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      try {
        // Get all conversations for this user
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .or(`client_id.eq.${user.id},owner_id.eq.${user.id}`)
          .eq('status', 'active');

        if (convError) throw convError;
        if (!conversations?.length) return 0;

        // Get conversation IDs as array
        const conversationIds = conversations.map(c => c.id);

        // Single query: get all unread messages for these conversations
        const { data: unreadMessages, error: unreadError } = await supabase
          .from('conversation_messages')
          .select('conversation_id')
          .in('conversation_id', conversationIds)
          .neq('sender_id', user.id)
          .eq('is_read', false);

        if (unreadError) throw unreadError;

        // Count unique conversation IDs with unread messages
        const uniqueConversationIds = new Set(
          (unreadMessages || []).map(m => m.conversation_id)
        );

        const count = uniqueConversationIds.size;
        return count;
      } catch (error) {
        console.error('[UnreadCount] Error:', error);
        return 0;
      }
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every 60 seconds (reduced from 30s to minimize unnecessary calls)
    staleTime: 5000, // Consider data fresh for 5 seconds to prevent excessive refetching
  });

  // Debounced refetch function to prevent excessive updates
  const debouncedRefetch = () => {
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }
    refetchTimeoutRef.current = setTimeout(() => {
      query.refetch();
    }, 1000); // Wait 1 second before refetching
  };

  // Set up real-time subscription for unread messages
  // Only listen to new message events (not updates) to reduce refetch frequency
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('unread-messages-count')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages'
        },
        (payload) => {
          // Only refetch if the message is not from the current user
          if (payload.new.sender_id !== user.id) {
            debouncedRefetch();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_messages'
        },
        (payload) => {
          // Only refetch if is_read status changed
          if (payload.old.is_read !== payload.new.is_read) {
            debouncedRefetch();
          }
        }
      )
      .subscribe();

    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    unreadCount: query.data || 0,
    isLoading: query.isLoading,
    refetch: query.refetch
  };
}