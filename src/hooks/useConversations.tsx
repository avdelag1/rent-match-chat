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
      if (!user?.id) return [];

      // Get conversations without requiring messages to exist
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`client_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Get other user profiles and last messages
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conversation) => {
          const otherUserId = conversation.client_id === user.id 
            ? conversation.owner_id 
            : conversation.client_id;

          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role')
            .eq('id', otherUserId)
            .maybeSingle();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('conversation_messages')
            .select('message_text, created_at, sender_id')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...conversation,
            other_user: profile,
            last_message: lastMessage
          };
        })
      );

      return conversationsWithProfiles;
    },
    enabled: !!user?.id,
  });
}

export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async () => {
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

      if (error) throw error;
      return data || [];
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

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(client_id.eq.${user.id},owner_id.eq.${otherUserId}),and(client_id.eq.${otherUserId},owner_id.eq.${user.id})`)
        .maybeSingle();

      let conversationId = existingConversation?.id;
      
      // If conversation doesn't exist, check quota
      if (!conversationId && !canStartNewConversation) {
        throw new Error('QUOTA_EXCEEDED');
      }

      if (!conversationId) {
        // Determine roles - Get current user's profile
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!myProfile) {
          throw new Error('Your profile could not be found. Please try again.');
        }

        // Get other user's profile
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', otherUserId)
          .single();

        if (!otherProfile) {
          throw new Error('Property owner profile not found. Please try again.');
        }

        const clientId = myProfile?.role === 'client' ? user.id : otherUserId;
        const ownerId = myProfile?.role === 'owner' ? user.id : otherUserId;

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
          console.error('❌ Conversation creation error:', conversationError);
          throw new Error(`Failed to create conversation: ${conversationError.message}`);
        }
        conversationId = newConversation.id;
        console.log('✅ New conversation created:', newConversation);

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
          console.log('✅ Match record created');
        } catch (matchError) {
          console.log('⚠️ Match creation failed, but conversation was created successfully:', matchError);
        }
      } else {
        console.log('✅ Using existing conversation:', conversationId);
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
        console.error('❌ Message creation error:', messageError);
        throw new Error(`Failed to send message: ${messageError.message}`);
      }
      console.log('✅ Message sent:', message);

      // Update conversation last_message_at
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (updateError) {
        console.error('⚠️ Failed to update conversation timestamp:', updateError);
        // Don't throw error here as the message was sent successfully
      }

      return { conversationId, message };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations-started-count'] });
      console.log('✅ Conversation created successfully:', data);
      toast({
        title: '💬 Conversation Started',
        description: 'Redirecting to chat...'
      });
    },
    onError: (error: Error) => {
      console.error('❌ Failed to start conversation:', error);
      
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
      console.log('✅ Message sent successfully via hook:', data);
      
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
      console.error('❌ Failed to send message via hook:', error);
      
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