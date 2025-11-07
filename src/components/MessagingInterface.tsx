import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { useConversationMessages, useSendMessage } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { useMessagingQuota } from '@/hooks/useMessagingQuota';
import { MessageQuotaDialog } from '@/components/MessageQuotaDialog';
import { TypingIndicator } from '@/components/TypingIndicator';
import { OnlineStatus, ConnectionStatus } from '@/components/OnlineStatus';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface MessagingInterfaceProps {
  conversationId: string;
  otherUser: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  onBack: () => void;
}

export function MessagingInterface({ conversationId, otherUser, onBack }: MessagingInterfaceProps) {
  const [newMessage, setNewMessage] = useState('');
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: messages = [], isLoading } = useConversationMessages(conversationId);
  const sendMessage = useSendMessage();
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get user's current role from profile
  const [userRole, setUserRole] = useState<'client' | 'owner'>('client');
  // Messages are unlimited within existing conversations - no quota check needed
  const messagingQuota = useMessagingQuota();
  
  // Real-time chat features
  const { 
    startTyping, 
    stopTyping, 
    isTyping, 
    typingUsers, 
    onlineUsers, 
    isConnected 
  } = useRealtimeChat(conversationId);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (data?.role) {
        setUserRole(data.role as 'client' | 'owner');
      }
    };
    
    fetchUserRole();
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show notification for new messages (handled by useRealtimeChat hook)
  useEffect(() => {
    if (!conversationId) return;
    
    // Subscribe to new message events for notifications only
    const handleNewMessage = (message: any) => {
      if (message.sender_id !== user?.id) {
        toast({
          title: "💬 New Message",
          description: `${otherUser.full_name}: ${message.message_text.slice(0, 50)}${message.message_text.length > 50 ? '...' : ''}`,
          duration: 4000,
        });
        
        // Browser notification if supported
        if (Notification.permission === 'granted') {
          const notification = new Notification(`Message from ${otherUser.full_name}`, {
            body: message.message_text.slice(0, 100),
            icon: otherUser.avatar_url || '/placeholder.svg',
            tag: `message-${message.id}`
          });
          
          setTimeout(() => notification.close(), 5000);
        }
      }
    };

    // Listen to the real-time subscription events (managed by useRealtimeChat)
    window.addEventListener('new-message', handleNewMessage as EventListener);
    
    return () => {
      window.removeEventListener('new-message', handleNewMessage as EventListener);
    };
  }, [conversationId, user?.id, otherUser]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // No quota check needed - messages are unlimited within existing conversations
    const messageText = newMessage.trim();
    setNewMessage('');
    
    // Stop typing indicator
    stopTyping();

    try {
      console.log('💬 Sending message:', messageText);
      
      // Send the actual message
      await sendMessage.mutateAsync({
        conversationId,
        message: messageText
      });
      
      console.log('✅ Message sent successfully');
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      
      toast({
        title: "Failed to Send",
        description: "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Handle typing detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Start typing indicator when user types
    if (e.target.value.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleUpgrade = () => {
    setShowQuotaDialog(false);
    // Navigate to subscription packages based on user role
    navigate('/subscription-packages');
  };

  if (isLoading) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="relative">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
            <AvatarImage src={otherUser.avatar_url} />
            <AvatarFallback>
              {otherUser.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <OnlineStatus isOnline={true} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base truncate">{otherUser.full_name}</h3>
          <Badge variant="secondary" className="text-xs">
            {otherUser.role === 'client' ? 'Client' : 'Property Owner'}
          </Badge>
        </div>
        <ConnectionStatus isConnected={isConnected} />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 overflow-hidden" ref={scrollAreaRef}>
        <div className="p-2 sm:p-4 space-y-3 sm:space-y-4 min-h-full">
          {messages.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <p className="text-sm sm:text-base text-muted-foreground">
                Start the conversation by sending a message!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isMyMessage = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-200`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-2xl shadow-sm ${
                      isMyMessage
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.message_text}</p>
                    <p className={`text-xs mt-1.5 ${
                      isMyMessage 
                        ? 'text-primary-foreground/60' 
                        : 'text-muted-foreground'
                    }`}>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <TypingIndicator typingUsers={typingUsers} />
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex gap-2 items-end">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 text-sm sm:text-base min-h-[44px] resize-none border-2 focus:border-primary/50"
            disabled={sendMessage.isPending}
            maxLength={1000}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            onBlur={stopTyping}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sendMessage.isPending}
            size="sm"
            className="shrink-0 h-[44px] w-[44px] rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex justify-between items-center mt-1 px-1">
          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </p>
          <p className="text-xs text-success">
            ✓ Unlimited messages in this conversation
          </p>
        </div>
      </form>
      
      <MessageQuotaDialog
        isOpen={showQuotaDialog}
        onClose={() => setShowQuotaDialog(false)}
        onUpgrade={handleUpgrade}
        userRole={userRole}
      />
    </Card>
  );
}