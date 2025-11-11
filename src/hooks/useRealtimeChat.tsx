import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

interface UserPresence {
  userId: string;
  userName: string;
  avatarUrl?: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

export function useRealtimeChat(conversationId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Track typing with debounce
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [typingChannelRef, setTypingChannelRef] = useState<any>(null);

  const startTyping = useCallback(() => {
    if (!conversationId || !user?.id || !typingChannelRef) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Send typing status if not already typing
    if (!isTyping) {
      setIsTyping(true);
      
      // Use existing channel reference
      typingChannelRef.track({
        userId: user.id,
        userName: user.user_metadata?.full_name || 'User',
        isTyping: true,
        timestamp: Date.now()
      }).catch(() => {
        // Silently handle presence tracking errors
      });
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      stopTyping();
    }, 3000);

    setTypingTimeout(timeout);
  }, [conversationId, user?.id, isTyping, typingTimeout, typingChannelRef]);

  const stopTyping = useCallback(() => {
    if (!conversationId || !user?.id || !typingChannelRef) return;

    setIsTyping(false);
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    typingChannelRef.track({
      userId: user.id,
      userName: user.user_metadata?.full_name || 'User',
      isTyping: false,
      timestamp: Date.now()
    }).catch(() => {
      // Silently handle presence tracking errors
    });
  }, [conversationId, user?.id, typingTimeout, typingChannelRef]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    // Messages subscription
    const messagesChannel = supabase
      .channel(`messages-${conversationId}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const newMessage = payload.new;
          
          // Get sender details
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const completeMessage = {
            ...newMessage,
            sender: senderProfile || { 
              id: newMessage.sender_id, 
              full_name: 'Unknown', 
              avatar_url: null 
            }
          };
          
          // Update messages immediately
          queryClient.setQueryData(['conversation-messages', conversationId], (oldData: any) => {
            if (!oldData) return [completeMessage];

            // Enhanced duplicate detection:
            // 1. Check for exact ID match (handles duplicate real-time events)
            // 2. Check for temporary optimistic IDs that match content and sender
            // 3. Check for near-duplicate messages (same sender, text, within 2 seconds)
            const newMessageTime = new Date(newMessage.created_at).getTime();

            const exists = oldData.some((msg: any) => {
              if (msg.id === newMessage.id) return true;

              // Check for optimistic message replacement
              if (msg.id.toString().startsWith('temp-') &&
                  msg.message_text === newMessage.message_text &&
                  msg.sender_id === newMessage.sender_id) {
                return true;
              }

              // Check for near-duplicates (within 2 seconds, same content and sender)
              const msgTime = new Date(msg.created_at).getTime();
              if (Math.abs(msgTime - newMessageTime) < 2000 &&
                  msg.message_text === newMessage.message_text &&
                  msg.sender_id === newMessage.sender_id) {
                return true;
              }

              return false;
            });

            if (exists) {
              // Replace optimistic message with real message if it exists
              return oldData.map((msg: any) =>
                msg.id.toString().startsWith('temp-') &&
                msg.message_text === newMessage.message_text &&
                msg.sender_id === newMessage.sender_id
                  ? completeMessage
                  : msg
              );
            }

            return [...oldData, completeMessage];
          });

          // Clear typing status for sender
          setTypingUsers(prev => prev.filter(u => u.userId !== newMessage.sender_id));
          
          // Dispatch custom event for notifications
          window.dispatchEvent(new CustomEvent('new-message', { detail: newMessage }));
        }
      )
      .on('presence', { event: 'sync' }, () => {
        // Only update if not already connected to avoid unnecessary re-renders
        setIsConnected(prev => {
          if (!prev) return true;
          return prev;
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // User joined
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // User left
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presence
          await messagesChannel.track({
            userId: user.id,
            userName: user.user_metadata?.full_name || 'User',
            avatarUrl: user.user_metadata?.avatar_url,
            status: 'online',
            lastSeen: new Date().toISOString()
          });
        }
      });

    // Typing indicators subscription
    const typingChannel = supabase
      .channel(`typing-${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = typingChannel.presenceState();

        const currentTyping: TypingUser[] = [];
        Object.values(newState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.isTyping && presence.userId !== user.id) {
              currentTyping.push({
                userId: presence.userId,
                userName: presence.userName,
                timestamp: presence.timestamp
              });
            }
          });
        });

        // Only update if typing users actually changed to avoid unnecessary re-renders
        setTypingUsers(prev => {
          // If lengths differ, definitely changed
          if (prev.length !== currentTyping.length) return currentTyping;

          // If same length, check if user IDs are different
          const prevIds = prev.map(u => u.userId).sort().join(',');
          const currentIds = currentTyping.map(u => u.userId).sort().join(',');

          if (prevIds !== currentIds) return currentTyping;

          // No changes, keep previous state
          return prev;
        });
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // New typing presence
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // Left typing presence
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Store channel reference for startTyping/stopTyping
          setTypingChannelRef(typingChannel);
        }
      });

    return () => {
      // Stop typing before cleanup
      if (isTyping) {
        stopTyping();
      }
      
      // Remove channels
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
      
      // Clear typing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Clear state
      setTypingUsers([]);
      setIsConnected(false);
      setTypingChannelRef(null);
    };
  }, [conversationId, user?.id, queryClient, stopTyping]);

  // Cleanup typing on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return {
    startTyping,
    stopTyping,
    isTyping,
    typingUsers,
    onlineUsers,
    isConnected
  };
}