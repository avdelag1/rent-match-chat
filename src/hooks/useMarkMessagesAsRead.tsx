import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useMarkMessagesAsRead(conversationId: string, isActive: boolean) {
  const { user } = useAuth();
  const hasMarkedRef = useRef(false);

  useEffect(() => {
    if (!conversationId || !user?.id || !isActive) {
      hasMarkedRef.current = false;
      return;
    }

    // Only mark once per conversation view to avoid repeated UPDATE queries
    if (hasMarkedRef.current) return;
    hasMarkedRef.current = true;

    // Mark all unread messages in this conversation as read
    // Do this in the background without triggering refetches
    const markAsRead = async () => {
      try {
        const { error } = await supabase
          .from('conversation_messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .eq('is_read', false);

        if (error) {
          console.error('[useMarkMessagesAsRead] Failed to mark messages as read:', error);
        }
      } catch (err) {
        console.error('[useMarkMessagesAsRead] Error marking messages as read:', err);
      }
    };

    // Mark as read after a small delay to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      markAsRead().catch(err => console.error('[useMarkMessagesAsRead] Promise rejection:', err));
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [conversationId, user?.id, isActive]);
}
