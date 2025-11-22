import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
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
import { formatDistanceToNow } from '@/utils/timeFormatter';
import { useQueryClient } from '@tanstack/react-query';
import { MessageActivationPackages } from '@/components/MessageActivationPackages';
import { SubscriptionPackages } from '@/components/SubscriptionPackages';

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

// Memoized message component to prevent unnecessary re-renders
const MessageBubble = memo(({ message, isMyMessage }: { message: any; isMyMessage: boolean }) => (
  <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
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
));

MessageBubble.displayName = 'MessageBubble';

export const MessagingInterface = memo(({ conversationId, otherUser, onBack }: MessagingInterfaceProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useConversationMessages(conversationId);
  const sendMessage = useSendMessage();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);
  const [showConnecting, setShowConnecting] = useState(false);
  const connectingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check monthly message limits
  const { canSendMessage, messagesRemaining, isAtLimit, hasMonthlyLimit } = useMonthlyMessageLimits();

  // Enable realtime chat for live message updates
  const { startTyping, stopTyping, typingUsers, isConnected } = useRealtimeChat(conversationId);

  // Mark messages as read when viewing this conversation
  useMarkMessagesAsRead(conversationId, true);

  // Debounce showing "Connecting" message to prevent flicker
  useEffect(() => {
    if (!isConnected) {
      // Only show "Connecting" message after 500ms of being disconnected
      connectingTimeoutRef.current = setTimeout(() => {
        setShowConnecting(true);
      }, 500);
    } else {
      // Clear timeout and hide connecting message immediately when connected
      if (connectingTimeoutRef.current) {
        clearTimeout(connectingTimeoutRef.current);
        connectingTimeoutRef.current = null;
      }
      setShowConnecting(false);
    }

    return () => {
      if (connectingTimeoutRef.current) {
        clearTimeout(connectingTimeoutRef.current);
        connectingTimeoutRef.current = null;
      }
    };
  }, [isConnected]);

  // Check if user is scrolled to bottom
  const isScrolledToBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // Consider "bottom" if within 100px of the bottom
    return scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  // Auto-scroll to bottom only when:
  // 1. User is already at the bottom (to show new messages)
  // 2. User sends a message (previousMessageCountRef tracks this)
  useEffect(() => {
    const messageCountIncreased = messages.length > previousMessageCountRef.current;
    previousMessageCountRef.current = messages.length;

    if (messageCountIncreased && isScrolledToBottom()) {
      // Use instant scroll to prevent flickering
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [messages, isScrolledToBottom]);

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
      {showConnecting && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-950 border-b border-yellow-200 dark:border-yellow-800 text-center">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            🔄 Connecting to chat...
          </p>
        </div>
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isMyMessage={message.sender_id === user?.id}
            />
          ))
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

      {/* Limit Warning with Upgrade Button */}
      {hasMonthlyLimit && isAtLimit && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-950 border-t border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm text-red-700 dark:text-red-300">Monthly message limit reached</p>
              <p className="text-xs opacity-80 text-red-600 dark:text-red-400 mt-0.5">Upgrade to continue messaging</p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowUpgradeDialog(true)}
              className="shrink-0"
            >
              Upgrade
            </Button>
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

      {/* Upgrade Dialog */}
      <MessageActivationPackages
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        userRole={otherUser.role === 'client' ? 'owner' : 'client'}
      />
    </Card>
  );
});

MessagingInterface.displayName = 'MessagingInterface';
