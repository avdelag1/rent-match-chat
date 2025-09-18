import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Heart, MessageSquare, Star } from 'lucide-react';

export function useNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to likes notifications
    const likesChannel = supabase
      .channel('likes_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
          filter: `target_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New like received:', payload);
          
          // Get the liker's profile information
          const { data: likerProfile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.user_id)
            .single();

          const likerName = likerProfile?.full_name || 'Someone';
          const likerRole = likerProfile?.role || 'user';
          
          if (payload.new.direction === 'right') {
            toast.success(
              `💖 ${likerName} liked you!`,
              {
                description: `A ${likerRole} showed interest in your profile`,
                action: {
                  label: 'View Profile',
                  onClick: () => {
                    // Navigate to profile or matches page
                    window.location.href = likerRole === 'owner' ? '/client/matches' : '/owner/matches';
                  },
                },
              }
            );
          }
        }
      )
      .subscribe();

    // Subscribe to matches notifications
    const matchesChannel = supabase
      .channel('matches_notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `or(client_id.eq.${user.id},owner_id.eq.${user.id})`
        },
        async (payload) => {
          console.log('Match updated:', payload);
          
          if (payload.new.is_mutual && !payload.old.is_mutual) {
            // This is a new mutual match!
            const isClient = payload.new.client_id === user.id;
            const otherUserId = isClient ? payload.new.owner_id : payload.new.client_id;
            
            // Get the other user's profile
            const { data: otherProfile } = await supabase
              .from('profiles')
              .select('full_name, role')
              .eq('id', otherUserId)
              .single();

            const otherName = otherProfile?.full_name || 'Someone';
            
            toast.success(
              `🎉 It's a Match!`,
              {
                description: `You and ${otherName} liked each other!`,
                action: {
                  label: 'Start Chat',
                  onClick: () => {
                    // Navigate to conversations
                    window.location.href = '/messaging';
                  },
                },
              }
            );
          }
        }
      )
      .subscribe();

    // Subscribe to messages notifications
    const messagesChannel = supabase
      .channel('messages_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Check if this message is for the current user
          const { data: conversation } = await supabase
            .from('conversations')
            .select('client_id, owner_id')
            .eq('id', payload.new.conversation_id)
            .single();

          if (!conversation) return;
          
          const isForCurrentUser = 
            conversation.client_id === user.id || conversation.owner_id === user.id;
          const isFromCurrentUser = payload.new.sender_id === user.id;
          
          // Only show notification if message is for current user but not from current user
          if (isForCurrentUser && !isFromCurrentUser) {
            // Get sender's profile
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', payload.new.sender_id)
              .single();

            const senderName = senderProfile?.full_name || 'Someone';
            
            toast.info(
              `💬 New message from ${senderName}`,
              {
                description: payload.new.message_text.length > 50 
                  ? payload.new.message_text.substring(0, 50) + '...'
                  : payload.new.message_text,
                action: {
                  label: 'Reply',
                  onClick: () => {
                    window.location.href = '/messaging';
                  },
                },
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user?.id]);

  return {
    // Could return methods to trigger notifications manually if needed
  };
}