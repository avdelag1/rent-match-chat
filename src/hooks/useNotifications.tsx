import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export function useNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Subscribe to messages for this user
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
        },
        async (payload) => {
          const newMessage = payload.new;
          
          // Only show notifications for messages not sent by current user
          if (newMessage.sender_id !== user.id) {
            // Get conversation details to check if current user is involved
            const { data: conversation } = await supabase
              .from('conversations')
              .select('*')
              .eq('id', newMessage.conversation_id)
              .single();

            if (conversation && 
                (conversation.client_id === user.id || conversation.owner_id === user.id)) {
              
              // Get sender info
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', newMessage.sender_id)
                .single();

              const senderName = senderProfile?.full_name || 'Someone';
              
              // Show toast notification
              toast({
                title: "New Message",
                description: `${senderName}: ${newMessage.message_text.slice(0, 50)}${newMessage.message_text.length > 50 ? '...' : ''}`,
                duration: 4000,
              });

              // Show browser notification if permission granted
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(`Message from ${senderName}`, {
                  body: newMessage.message_text.slice(0, 100),
                  icon: senderProfile?.avatar_url || '/placeholder.svg',
                  tag: `message-${newMessage.id}`, // Prevent duplicate notifications
                  requireInteraction: false,
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    requestPermission: () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.requestPermission();
      }
      return Promise.resolve('denied');
    },
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
    permission: typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  };
}