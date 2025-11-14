import React, { useState, useRef, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, AlertCircle, Zap } from 'lucide-react';
import { useConversationMessages, useSendMessage } from '@/hooks/useConversations';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { useMarkMessagesAsRead } from '@/hooks/useMarkMessagesAsRead';
import { useAuth } from '@/hooks/useAuth';
import { useMonthlyMessageLimits } from '@/hooks/useMonthlyMessageLimits';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

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

export const MessagingInterface = memo(({ conversationId, otherUser, onBack }: MessagingInterfaceProps) => {
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useConversationMessages(conversationId);
  const sendMessage = useSendMessage();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check monthly message limits
  const { canSendMessage, messagesRemaining, isAtLimit, hasMonthlyLimit } = useMonthlyMessageLimits();

  // Enable realtime chat for live message updates
  const { startTyping, stopTyping, typingUsers, isConnected } = useRealtimeChat(conversationId);

  // Mark messages as read when viewing this conversation
  useMarkMessagesAsRead(conversationId, true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    stopTyping(); // Stop typing indicator when message is sent

    try {
      await sendMessage.mutateAsync({
        conversationId,
        message: messageText
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageText); // Restore message on error
    }
  };

  if (isLoading) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b shrink-0 bg-background/95">
        <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="relative">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={otherUser.avatar_url} />
            <AvatarFallback>
              {otherUser.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{otherUser.full_name}</h3>
          <Badge variant="secondary" className="text-xs">
            {otherUser.role === 'client' ? 'Client' : 'Owner'}
          </Badge>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-950 border-b border-yellow-200 dark:border-yellow-800 text-center">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            🔄 Connecting to chat...
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMyMessage = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    isMyMessage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm break-words whitespace-pre-wrap">{message.message_text}</p>
                  <p className={`text-xs mt-1.5 opacity-70`}>
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Limit Warning */}
      {hasMonthlyLimit && isAtLimit && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-950 border-t border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700 dark:text-red-300">
            <p className="font-medium">Monthly message limit reached</p>
            <p className="text-xs opacity-80">Upgrade your plan to send more messages</p>
          </div>
        </div>
      )}

      {/* Limit Info */}
      {hasMonthlyLimit && !isAtLimit && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
            <Zap className="w-3 h-3" />
            <span>{messagesRemaining} messages remaining this month</span>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t shrink-0 bg-background/95">
        <div className="flex gap-2 items-end">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (e.target.value.trim()) {
                startTyping(); // Trigger typing indicator
              } else {
                stopTyping();
              }
            }}
            placeholder={isAtLimit ? "Monthly limit reached" : "Type a message..."}
            className="flex-1 text-sm min-h-[44px]"
            disabled={sendMessage.isPending || isAtLimit}
            maxLength={1000}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sendMessage.isPending || isAtLimit}
            size="sm"
            className="shrink-0 h-[44px] w-[44px] rounded-lg"
            title={isAtLimit ? "Monthly message limit reached" : "Send message"}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
});

MessagingInterface.displayName = 'MessagingInterface';
