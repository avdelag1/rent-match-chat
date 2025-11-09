import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export function useUnreadMessageCount() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['unread-message-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      // Get all conversations for this user
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`client_id.eq.${user.id},owner_id.eq.${user.id}`);

      if (!conversations?.length) return 0;

      // Count conversations with at least one unread message
      let conversationsWithUnreadCount = 0;
      
      for (const conv of conversations) {
        const { count } = await supabase
          .from('conversation_messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id)
          .eq('is_read', false)
          .limit(1);
        
        if (count && count > 0) {
          conversationsWithUnreadCount++;
        }
      }

      return conversationsWithUnreadCount;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  // Set up real-time subscription for unread messages
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
        () => {
          // Refetch count when new messages are inserted
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_messages'
        },
        () => {
          // Refetch count when messages are updated (marked as read)
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, query]);

  return {
    unreadCount: query.data || 0,
    isLoading: query.isLoading,
    refetch: query.refetch
  };
}