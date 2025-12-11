import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'like' | 'message' | 'super_like' | 'match' | 'new_user';
  title: string;
  message: string;
  avatar?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  relatedUserId?: string;
  conversationId?: string;
}

export function useNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch existing notifications from database on mount
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      if (data && data.length > 0) {
        const formattedNotifications: Notification[] = data.map(notif => ({
          id: notif.id,
          type: notif.type as any,
          title: notif.type === 'like' ? 'New Like' :
                 notif.type === 'match' ? 'New Match' :
                 notif.type === 'message' ? 'New Message' : 'Notification',
          message: notif.message || '',
          timestamp: new Date(notif.created_at),
          read: notif.read || false,
          actionUrl: (notif as any).link_url,
          relatedUserId: (notif as any).related_user_id || undefined,
        }));
        setNotifications(formattedNotifications);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to swipes (likes/super likes)
    const swipesChannel = supabase
      .channel('user-swipes-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swipes',
          filter: `target_id=eq.${user.id}`,
        },
        async (payload) => {
          const swipe = payload.new;
          
          // Get swiper profile
          const { data: swiperProfile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', swipe.user_id)
            .single();

          const { data: swiperRoleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', swipe.user_id)
            .maybeSingle();

          if (swiperProfile) {
            const notification: Notification = {
              id: `swipe-${swipe.id}`,
              type: swipe.swipe_type === 'super_like' ? 'super_like' : 'like',
              title: swiperProfile.full_name || 'Someone',
              message: swipe.swipe_type === 'super_like' 
                ? 'gave you a Super Like! ⭐' 
                : 'liked your profile! 🔥',
              avatar: swiperProfile.avatar_url,
              timestamp: new Date(),
              read: false,
              relatedUserId: swipe.user_id,
              actionUrl: swiperRoleData?.role === 'client' ? '/owner/liked-clients' : '/client/liked-properties'
            };
            
            setNotifications(prev => [notification, ...prev]);
          }
        }
      )
      .subscribe();

    // Subscribe to new conversation messages
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
          const message = payload.new;
          
          // Only show notifications for messages not sent by current user
          if (message.sender_id === user.id) return;
          
          // Check if current user is involved in the conversation
          const { data: conversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', message.conversation_id)
            .single();

          if (conversation && 
              (conversation.client_id === user.id || conversation.owner_id === user.id)) {
            
            // Get sender info
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', message.sender_id)
              .single();

            if (senderProfile) {
              const notification: Notification = {
                id: `message-${message.id}`,
                type: 'message',
                title: senderProfile.full_name || 'Someone',
                message: `sent you a message: "${message.message_text.slice(0, 50)}${message.message_text.length > 50 ? '...' : ''}"`,
                avatar: senderProfile.avatar_url,
                timestamp: new Date(),
                read: false,
                relatedUserId: message.sender_id,
                conversationId: message.conversation_id,
                actionUrl: '/messaging'
              };
              
              setNotifications(prev => [notification, ...prev]);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to matches
    const matchesChannel = supabase
      .channel('user-match-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `or(client_id.eq.${user.id},owner_id.eq.${user.id})`,
        },
        async (payload) => {
          const match = payload.new;
          
          // Only notify when match becomes mutual
          if (match.is_mutual && !payload.old.is_mutual) {
            const otherUserId = match.client_id === user.id ? match.owner_id : match.client_id;
            
            // Get other user's profile
            const { data: otherProfile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', otherUserId)
              .single();

            if (otherProfile) {
              const notification: Notification = {
                id: `match-${match.id}`,
                type: 'match',
                title: 'It\'s a Match! 🎉',
                message: `You and ${otherProfile.full_name} liked each other!`,
                avatar: otherProfile.avatar_url,
                timestamp: new Date(),
                read: false,
                relatedUserId: otherUserId,
                actionUrl: '/messaging'
              };
              
              setNotifications(prev => [notification, ...prev]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(swipesChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(matchesChannel);
    };
  }, [user?.id]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );

    // Navigate to appropriate page
    if (notification.actionUrl) {
      if (notification.type === 'message' && notification.conversationId) {
        navigate(`/messaging?conversation=${notification.conversationId}`);
      } else {
        navigate(notification.actionUrl);
      }
    }
  };

  return {
    notifications,
    dismissNotification,
    markAllAsRead,
    handleNotificationClick,
    unreadCount: notifications.filter(n => !n.read).length
  };
}