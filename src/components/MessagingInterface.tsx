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

// Memoized message component with modern bubble design
const MessageBubble = memo(({ message, isMyMessage }: { message: any; isMyMessage: boolean }) => (
  <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} group`}>
    <div
      className={`max-w-[80%] px-4 py-2.5 ${
        isMyMessage
          ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-br-md shadow-md'
          : 'bg-muted/80 backdrop-blur-sm rounded-2xl rounded-bl-md border border-border/50'
      }`}
    >
      <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">{message.message_text}</p>
      <p className={`text-[10px] mt-1 ${isMyMessage ? 'text-primary-foreground/60' : 'text-muted-foreground'} opacity-0 group-hover:opacity-100 transition-opacity`}>
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
    } catch (error: any) {
      console.error('Failed to send message:', error);

      // Provide more helpful error messages for debugging
      const errorMessage = error?.message || 'Unknown error occurred';
      const errorDetails = {
        message: errorMessage,
        code: error?.code,
        conversationId,
        timestamp: new Date().toISOString()
      };

      console.error('Send error details:', errorDetails);

      // Help identify common issues
      if (errorMessage.includes('message_text')) {
        console.error('❌ Database schema issue detected - message_text column may not exist');
      } else if (errorMessage.includes('receiver_id')) {
        console.error('❌ Conversation error - receiver_id could not be determined');
      } else if (errorMessage.includes('RLS') || errorMessage.includes('policy')) {
        console.error('❌ Permission error - Row Level Security policy may be blocking the insert');
      }

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
    <Card className="flex-1 flex flex-col h-full overflow-hidden border-0 shadow-xl">
      {/* Modern Header with gradient */}
      <div className="flex items-center gap-3 p-4 border-b shrink-0 bg-gradient-to-r from-background via-background to-muted/30 backdrop-blur-xl">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 rounded-full hover:bg-muted/80 w-9 h-9">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="relative">
          <Avatar className="w-11 h-11 shrink-0 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={otherUser.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-bold">
              {otherUser.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">{otherUser.full_name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 bg-primary/10 text-primary border-primary/20">
              {otherUser.role === 'client' ? '🏠 Client' : '🔑 Owner'}
            </Badge>
            <span className="text-[10px] text-green-500 font-medium">● Online</span>
          </div>
        </div>
      </div>

      {/* Cool Connection Status */}
      {showConnecting && (
        <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-b border-amber-500/20 text-center backdrop-blur-sm">
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            Connecting to chat...
          </p>
        </div>
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-muted/10">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
              <Send className="w-7 h-7 text-primary/60" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Start the conversation
            </p>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              Say hello to {otherUser.full_name?.split(' ')[0] || 'your match'}! 👋
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
        {/* Cool Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start items-end gap-2">
            <div className="px-4 py-3 bg-muted/60 backdrop-blur-sm rounded-2xl rounded-bl-md border border-border/30">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground mb-1">typing...</span>
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

      {/* Modern Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 border-t shrink-0 bg-gradient-to-t from-muted/30 to-background">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                if (e.target.value.trim()) {
                  startTyping();
                } else {
                  stopTyping();
                }
              }}
              placeholder={isAtLimit ? "Monthly limit reached" : "Type a message..."}
              className="flex-1 text-sm min-h-[48px] pr-4 rounded-2xl border-muted-foreground/20 bg-muted/50 focus:bg-background focus:border-primary/50 transition-all"
              disabled={sendMessage.isPending || isAtLimit}
              maxLength={1000}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e as any);
                }
              }}
            />
            {newMessage.length > 800 && (
              <span className="absolute right-3 bottom-1 text-[10px] text-muted-foreground">
                {1000 - newMessage.length}
              </span>
            )}
          </div>
          <Button
            type="submit"
            disabled={!newMessage.trim() || sendMessage.isPending || isAtLimit}
            size="icon"
            className={`shrink-0 h-12 w-12 rounded-full shadow-lg transition-all ${
              newMessage.trim() && !isAtLimit
                ? 'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 scale-100'
                : 'bg-muted scale-95'
            }`}
            title={isAtLimit ? "Monthly message limit reached" : "Send message"}
          >
            <Send className={`w-5 h-5 transition-transform ${newMessage.trim() ? 'translate-x-0.5' : ''}`} />
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
