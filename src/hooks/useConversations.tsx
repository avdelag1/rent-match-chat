import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useMessagingQuota } from '@/hooks/useMessagingQuota';

interface Conversation {
  id: string;
  client_id: string;
  owner_id: string;
  listing_id?: string;
  last_message_at?: string;
  status: string;
  created_at: string;
  updated_at: string;
  // Joined data
  other_user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  last_message?: {
    message_text: string;
    created_at: string;
    sender_id: string;
  };
}

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.warn('[useConversations] No authenticated user');
        return [];
      }

      try {
        // OPTIMIZED: Single query with joins instead of N+1 queries
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            client_profile:profiles!conversations_client_id_fkey(id, full_name, avatar_url),
            owner_profile:profiles!conversations_owner_id_fkey(id, full_name, avatar_url),
            client_role:user_roles!conversations_client_id_fkey(role),
            owner_role:user_roles!conversations_owner_id_fkey(role)
          `)
          .or(`client_id.eq.${user.id},owner_id.eq.${user.id}`)
          .order('last_message_at', { ascending: false, nullsFirst: false });

        if (error) {
          console.error('[useConversations] Error fetching conversations:', error);
          // Gracefully handle RLS errors
          if (error.code === 'PGRST116' || error.message?.includes('permission')) {
            toast({
              title: 'Unable to Load Conversations',
              description: 'Please try refreshing the page.',
              variant: 'destructive'
            });
          }
          throw error;
        }

        // Get all conversation IDs for batch message query
        const conversationIds = (data || []).map(c => c.id);

        if (conversationIds.length === 0) {
          return [];
        }

        // OPTIMIZED: Single query for all last messages instead of N queries
        const { data: messagesData, error: messagesError } = await supabase
          .from('conversation_messages')
          .select('conversation_id, message_text, created_at, sender_id')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false });

        if (messagesError) {
          console.warn('[useConversations] Error fetching messages:', messagesError);
          // Don't fail the whole query if messages fail
        }

        // Create a map of conversation_id to last message
        const lastMessagesMap = new Map();
        messagesData?.forEach(msg => {
          if (!lastMessagesMap.has(msg.conversation_id)) {
            lastMessagesMap.set(msg.conversation_id, msg);
          }
        });

        // Transform data to include other_user and last_message
        const conversationsWithProfiles = (data || []).map((conversation: any) => {
          const isClient = conversation.client_id === user.id;
          const otherUserProfile = isClient ? conversation.owner_profile : conversation.client_profile;
          const otherUserRole = isClient ? conversation.owner_role?.role : conversation.client_role?.role;

          return {
            id: conversation.id,
            client_id: conversation.client_id,
            owner_id: conversation.owner_id,
            listing_id: conversation.listing_id,
            last_message_at: conversation.last_message_at,
            status: conversation.status,
            created_at: conversation.created_at,
            updated_at: conversation.updated_at,
            other_user: otherUserProfile ? {
              ...otherUserProfile,
              role: otherUserRole || 'client'
            } : undefined,
            last_message: lastMessagesMap.get(conversation.id)
          };
        });

        return conversationsWithProfiles;
      } catch (error) {
        console.error('[useConversations] Unexpected error:', error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }
    },
    enabled: !!user?.id,
    // Add staleTime for better caching
    staleTime: 30000, // 30 seconds
  });
}

export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) {
        console.warn('[useConversationMessages] No conversation ID provided');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('conversation_messages')
          .select(`
            *,
            sender:profiles!conversation_messages_sender_id_fkey (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[useConversationMessages] Error fetching messages:', error);
          // Graceful degradation for permission errors
          if (error.code === 'PGRST116' || error.message?.includes('permission')) {
            toast({
              title: 'Unable to Load Messages',
              description: 'You may not have permission to view this conversation.',
              variant: 'destructive'
            });
          }
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('[useConversationMessages] Unexpected error:', error);
        return [];
      }
    },
    enabled: !!conversationId,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      otherUserId, 
      listingId, 
      initialMessage,
      canStartNewConversation
    }: { 
      otherUserId: string; 
      listingId?: string; 
      initialMessage: string;
      canStartNewConversation: boolean;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check if conversation already exists (check both directions)
      const { data: existingConversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(client_id.eq.${user.id},owner_id.eq.${otherUserId}),and(client_id.eq.${otherUserId},owner_id.eq.${user.id})`);

      const existingConversation = existingConversations?.[0];

      let conversationId = existingConversation?.id;
      
      // If conversation doesn't exist, check quota
      if (!conversationId && !canStartNewConversation) {
        throw new Error('QUOTA_EXCEEDED');
      }

      if (!conversationId) {
        // Get both users' roles directly from user_roles table
        const { data: myRoleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!myRoleData) {
          throw new Error('Your profile could not be found. Please try logging out and back in.');
        }

        const { data: otherRoleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', otherUserId)
          .maybeSingle();

        if (!otherRoleData) {
          throw new Error('The other user profile could not be found. They may not have completed their registration.');
        }

        // Determine client and owner IDs based on roles
        const clientId = myRoleData.role === 'client' ? user.id : otherUserId;
        const ownerId = myRoleData.role === 'owner' ? user.id : otherUserId;

        // Create conversation without requiring a match first (match_id is now nullable)
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            client_id: clientId,
            owner_id: ownerId,
            listing_id: listingId,
            match_id: null, // We'll create the match after if needed
            status: 'active'
          })
          .select()
          .single();

        if (conversationError) {
          throw new Error(`Failed to create conversation: ${conversationError.message}`);
        }
        conversationId = newConversation.id;

        // Optionally create a match record for tracking purposes (but don't block conversation if it fails)
        try {
          await supabase
            .from('matches')
            .insert({
              client_id: clientId,
              owner_id: ownerId,
              listing_id: listingId,
              is_mutual: true,
              status: 'accepted',
              client_liked_at: new Date().toISOString(),
              owner_liked_at: new Date().toISOString()
            });
        } catch (matchError) {
          // Match creation failed, but conversation was created successfully
        }
      }

      // Send initial message
      const { data: message, error: messageError } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message_text: initialMessage,
          message_type: 'text'
        })
        .select()
        .single();

      if (messageError) {
        throw new Error(`Failed to send message: ${messageError.message}`);
      }

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return { conversationId, message };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations-started-count'] });
      toast({
        title: '💬 Conversation Started',
        description: 'Redirecting to chat...'
      });
    },
    onError: (error: Error) => {
      if (error.message === 'QUOTA_EXCEEDED') {
        toast({
          title: 'Conversation Limit Reached',
          description: 'Upgrade your plan to start more conversations',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Failed to Send Message',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      message 
    }: { 
      conversationId: string; 
      message: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Create optimistic message for immediate UI update
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        message_text: message,
        message_type: 'text',
        created_at: new Date().toISOString(),
        is_read: false,
        sender: {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'You',
          avatar_url: user.user_metadata?.avatar_url
        }
      };

      // Immediately add optimistic message to UI
      queryClient.setQueryData(['conversation-messages', conversationId], (oldData: any) => {
        if (!oldData) return [optimisticMessage];
        return [...oldData, optimisticMessage];
      });

      const { data, error } = await supabase
        .from('conversation_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message_text: message,
          message_type: 'text'
        })
        .select(`
          *,
          sender:profiles!conversation_messages_sender_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return data;
    },
    onSuccess: (data, variables) => {
      // Replace optimistic message with real message
      queryClient.setQueryData(['conversation-messages', variables.conversationId], (oldData: any) => {
        if (!oldData) return [data];
        
        return oldData.map((msg: any) => 
          msg.id.toString().startsWith('temp-') && msg.message_text === data.message_text
            ? data
            : msg
        );
      });
      
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
    },
    onError: (error: Error, variables) => {
      // Remove optimistic message on error
      queryClient.setQueryData(['conversation-messages', variables.conversationId], (oldData: any) => {
        if (!oldData) return [];
        return oldData.filter((msg: any) => !msg.id.toString().startsWith('temp-'));
      });
      
      toast({
        title: 'Failed to Send Message',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useConversationStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversation-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { conversationsUsed: 0, conversationsLeft: 999, isPremium: true };

      // Allow unlimited conversations for all users
      return {
        conversationsUsed: 0,
        conversationsLeft: 999,
        isPremium: true
      };
    },
    enabled: !!user?.id
  });
}