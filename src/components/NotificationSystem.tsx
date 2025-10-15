import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationSystem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    // Request notification permission if not already granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast({
            title: "🔔 Notifications Enabled",
            description: "You'll now receive real-time message notifications!",
            duration: 3000,
          });
        }
      });
    }

    // Subscribe to new messages for real-time notifications
    const messagesChannel = supabase
      .channel('user-message-notifications')
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
            // Check if current user is part of this conversation
            const { data: conversation } = await supabase
              .from('conversations')
              .select('client_id, owner_id')
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

              const { data: senderRoleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', newMessage.sender_id)
                .maybeSingle();

              const senderName = senderProfile?.full_name || 'Someone';
              const senderRole = senderRoleData?.role === 'client' ? 'Client' : 'Property Owner';
              
              // Show toast notification  
              const messageText = newMessage.message_text || '';
              toast({
                title: `💬 New Message from ${senderRole}`,
                description: `${senderName}: ${messageText.slice(0, 60)}${messageText.length > 60 ? '...' : ''}`,
                duration: 6000,
              });

              // Show browser notification if permission granted
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                const messageText = newMessage.message_text || 'New message';
                const notification = new Notification(`New message from ${senderName}`, {
                  body: messageText.slice(0, 100),
                  icon: senderProfile?.avatar_url || '/placeholder.svg',
                  tag: `message-${newMessage.id}`,
                  badge: '/favicon.ico',
                  requireInteraction: false,
                });

                // Auto-close notification after 6 seconds
                setTimeout(() => notification.close(), 6000);

                // Handle notification click
                notification.onclick = () => {
                  window.focus();
                  notification.close();
                  // Navigate to messages if not already there
                  if (!window.location.pathname.includes('/messages')) {
                    window.location.href = '/messages';
                  }
                };
              }

              // Invalidate relevant queries to update UI
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
              queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
              queryClient.invalidateQueries({ 
                queryKey: ['conversation-messages', newMessage.conversation_id] 
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to likes for notifications
    const likesChannel = supabase
      .channel('user-like-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
        },
        async (payload) => {
          const newLike = payload.new;
          
          // Only show notifications for likes received (not given)
          if (newLike.target_id === user.id && newLike.user_id !== user.id) {
            // Get liker info
            const { data: likerProfile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', newLike.user_id)
              .single();

            const { data: likerRoleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', newLike.user_id)
              .maybeSingle();

            const likerName = likerProfile?.full_name || 'Someone';
            const likerRole = likerRoleData?.role === 'client' ? 'Client' : 'Property Owner';
            
            // Show toast notification
            toast({
              title: `❤️ New Like from ${likerRole}`,
              description: `${likerName} liked your ${newLike.direction === 'client_to_listing' ? 'property' : 'profile'}!`,
              duration: 5000,
            });

            // Show browser notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              const notification = new Notification(`New like from ${likerName}`, {
                body: `${likerName} liked your ${newLike.direction === 'client_to_listing' ? 'property' : 'profile'}!`,
                icon: likerProfile?.avatar_url || '/placeholder.svg',
                tag: `like-${newLike.id}`,
                badge: '/favicon.ico',
              });

              setTimeout(() => notification.close(), 5000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [user?.id, queryClient]);

  return null; // This component doesn't render anything
}