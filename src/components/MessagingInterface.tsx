import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, AlertCircle, Zap, ChevronLeft, User, Home, Info, ChevronRight } from 'lucide-react';
import { useConversationMessages, useSendMessage } from '@/hooks/useConversations';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { useMarkMessagesAsRead } from '@/hooks/useMarkMessagesAsRead';
import { useAuth } from '@/hooks/useAuth';
import { useMonthlyMessageLimits } from '@/hooks/useMonthlyMessageLimits';
import { formatDistanceToNow } from '@/utils/timeFormatter';
import { useQueryClient } from '@tanstack/react-query';
import { MessageActivationPackages } from '@/components/MessageActivationPackages';
import { SubscriptionPackages } from '@/components/SubscriptionPackages';
import { ChatPreviewSheet } from '@/components/ChatPreviewSheet';

interface MessagingInterfaceProps {
  conversationId: string;
  otherUser: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role: string;
  };
  listing?: {
    id: string;
    title: string;
    price?: number;
    images?: string[];
    category?: string;
    mode?: string;
    address?: string;
    city?: string;
  };
  currentUserRole?: 'client' | 'owner';
  onBack: () => void;
}

// iOS-style message bubble colors based on conversation type
const getBubbleColors = (otherUserRole: string, isMyMessage: boolean) => {
  if (!isMyMessage) {
    // Received messages - always gray/muted
    return {
      background: 'bg-[#3A3A3C]',
      text: 'text-white',
      timestamp: 'text-white/50'
    };
  }

  // Sent messages - different colors based on who you're talking to
  if (otherUserRole === 'owner') {
    // Talking to Owner - Orange-Red gradient (vibrant)
    return {
      background: 'bg-gradient-to-br from-[#FF6B35] to-[#F7931E]',
      text: 'text-white',
      timestamp: 'text-white/60'
    };
  } else {
    // Talking to Client - Blue gradient (iMessage style)
    return {
      background: 'bg-gradient-to-br from-[#007AFF] to-[#5856D6]',
      text: 'text-white',
      timestamp: 'text-white/60'
    };
  }
};

interface MessageType {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  message_type: string;
  created_at: string;
  is_read?: boolean;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

// Memoized iOS-style message bubble component
const MessageBubble = memo(({ message, isMyMessage, otherUserRole }: { message: MessageType; isMyMessage: boolean; otherUserRole: string }) => {
  const colors = getBubbleColors(otherUserRole, isMyMessage);

  return (
    <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 ${colors.background} ${colors.text} ${
          isMyMessage
            ? 'rounded-[20px] rounded-br-[6px]'
            : 'rounded-[20px] rounded-bl-[6px]'
        } shadow-sm`}
      >
        <p className="text-[15px] break-words whitespace-pre-wrap leading-[1.35]">{message.message_text}</p>
        <p className={`text-[10px] mt-1 ${colors.timestamp} text-right`}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: false })}
        </p>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export const MessagingInterface = memo(({ conversationId, otherUser, listing, currentUserRole = 'client', onBack }: MessagingInterfaceProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showPreviewSheet, setShowPreviewSheet] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
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
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      if (import.meta.env.DEV) {
        console.error('Failed to send message:', error);
      }

      // Provide more helpful error messages for debugging
      const errorMessage = err?.message || 'Unknown error occurred';

      if (import.meta.env.DEV) {
        const errorDetails = {
          message: errorMessage,
          code: err?.code,
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
      }

      setNewMessage(messageText); // Restore message on error
    }
  };

  if (isLoading) {
    return (
      <Card className="flex-1 flex items-center justify-center border-0 shadow-none bg-[#1C1C1E]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="w-2 h-2 bg-[#8E8E93] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-[#8E8E93] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-[#8E8E93] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          <p className="text-[#8E8E93] text-sm">Loading conversation...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col h-full overflow-hidden border-0 shadow-none bg-[#1C1C1E]">
      {/* iOS-style Header - Modernized */}
      <div className="border-b border-[#38383A] shrink-0 bg-[#1C1C1E]/95 backdrop-blur-xl">
        {/* Main Header Row */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="shrink-0 text-[#007AFF] hover:bg-transparent hover:text-[#0056CC] px-1 -ml-1"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-[17px] font-normal hidden sm:inline">Back</span>
          </Button>

          {/* Clickable Center Section */}
          <button
            onClick={() => setShowPreviewSheet(true)}
            className="flex-1 flex items-center justify-center gap-3 min-w-0 py-1 hover:bg-[#2C2C2E]/50 rounded-xl transition-colors active:scale-[0.98]"
          >
            <div className="relative shrink-0">
              <Avatar className="w-10 h-10">
                <AvatarImage src={otherUser.avatar_url} />
                <AvatarFallback className={`font-semibold text-white ${
                  otherUser.role === 'owner'
                    ? 'bg-gradient-to-br from-[#FF6B35] to-[#F7931E]'
                    : 'bg-gradient-to-br from-[#007AFF] to-[#5856D6]'
                }`}>
                  {otherUser.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#34C759] rounded-full border-2 border-[#1C1C1E]" />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <h3 className="font-semibold text-[15px] text-white truncate max-w-[150px] sm:max-w-[200px]">
                {otherUser.full_name}
              </h3>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 h-4 border-0 ${
                    otherUser.role === 'owner'
                      ? 'bg-[#FF6B35]/20 text-[#FF6B35]'
                      : 'bg-[#007AFF]/20 text-[#007AFF]'
                  }`}
                >
                  {otherUser.role === 'client' ? 'Client' : 'Owner'}
                </Badge>
                <span className="text-[10px] text-[#34C759] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#34C759] rounded-full"></span>
                  Online
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#48484A] shrink-0" />
          </button>

          {/* Quick Action Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPreviewSheet(true)}
            className="shrink-0 w-9 h-9 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3C] text-[#8E8E93]"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>

        {/* Listing Context Bar - Shows when there's a listing attached */}
        {listing && currentUserRole === 'client' && (
          <button
            onClick={() => setShowPreviewSheet(true)}
            className="w-full px-4 py-2 bg-[#2C2C2E]/50 flex items-center gap-3 hover:bg-[#2C2C2E] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center shrink-0">
              <Home className="w-4 h-4 text-[#FF6B35]" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs text-[#8E8E93]">Chatting about</p>
              <p className="text-sm text-white font-medium truncate">{listing.title}</p>
            </div>
            <div className="text-right shrink-0">
              {listing.price && (
                <p className="text-sm font-semibold text-[#34C759]">
                  ${listing.price.toLocaleString()}
                  <span className="text-[10px] text-[#8E8E93] font-normal">
                    {listing.mode === 'rent' ? '/mo' : ''}
                  </span>
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-[#48484A] shrink-0" />
          </button>
        )}
      </div>

      {/* iOS-style Connection Status */}
      {showConnecting && (
        <div className="px-4 py-2 bg-[#2C2C2E] border-b border-[#38383A] text-center">
          <p className="text-xs text-[#FF9F0A] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#FF9F0A] rounded-full animate-pulse" />
            Connecting to chat...
          </p>
        </div>
      )}

      {/* Messages - iOS-style */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-3 bg-[#000000]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              otherUser.role === 'owner'
                ? 'bg-[#FF6B35]/20'
                : 'bg-[#007AFF]/20'
            }`}>
              <Send className={`w-7 h-7 ${
                otherUser.role === 'owner' ? 'text-[#FF6B35]' : 'text-[#007AFF]'
              }`} />
            </div>
            <p className="text-sm font-medium text-white mb-1">
              Start the conversation
            </p>
            <p className="text-xs text-[#8E8E93] max-w-[200px]">
              Say hello to {otherUser.full_name?.split(' ')?.[0] || 'your match'}!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMyMessage={message.sender_id === user?.id}
                otherUserRole={otherUser.role}
              />
            ))}
          </div>
        )}
        {/* iOS-style Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start items-end gap-2 mt-1">
            <div className="px-4 py-3 bg-[#3A3A3C] rounded-[20px] rounded-bl-[6px]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#8E8E93] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-[#8E8E93] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-[#8E8E93] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* iOS-style Limit Warning */}
      {hasMonthlyLimit && isAtLimit && (
        <div className="px-4 py-3 bg-[#2C2C2E] border-t border-[#38383A]">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF453A] flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm text-[#FF453A]">Monthly limit reached</p>
              <p className="text-xs text-[#8E8E93] mt-0.5">Upgrade to continue messaging</p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowUpgradeDialog(true)}
              className="shrink-0 bg-[#007AFF] hover:bg-[#0056CC] text-white border-0 rounded-full px-4"
            >
              Upgrade
            </Button>
          </div>
        </div>
      )}

      {/* iOS-style Limit Info */}
      {hasMonthlyLimit && !isAtLimit && (
        <div className="px-4 py-2 bg-[#2C2C2E] border-t border-[#38383A] flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
            <Zap className="w-3 h-3 text-[#FF9F0A]" />
            <span>{messagesRemaining} messages remaining</span>
          </div>
        </div>
      )}

      {/* iOS-style Input Area */}
      <form onSubmit={handleSendMessage} className="px-3 py-2 border-t border-[#38383A] shrink-0 bg-[#1C1C1E]">
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
              placeholder={isAtLimit ? "Monthly limit reached" : "iMessage"}
              className="flex-1 text-[15px] min-h-[36px] px-4 py-2 rounded-full border-[#38383A] bg-[#2C2C2E] text-white placeholder:text-[#8E8E93] focus:border-[#48484A] focus:ring-0 focus:ring-offset-0 transition-all"
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
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#8E8E93]">
                {1000 - newMessage.length}
              </span>
            )}
          </div>
          <Button
            type="submit"
            disabled={!newMessage.trim() || sendMessage.isPending || isAtLimit}
            size="icon"
            className={`shrink-0 h-9 w-9 rounded-full transition-all border-0 ${
              newMessage.trim() && !isAtLimit
                ? otherUser.role === 'owner'
                  ? 'bg-gradient-to-br from-[#FF6B35] to-[#F7931E] hover:from-[#FF5722] hover:to-[#E68A00]'
                  : 'bg-gradient-to-br from-[#007AFF] to-[#5856D6] hover:from-[#0056CC] hover:to-[#4A45B5]'
                : 'bg-[#3A3A3C] opacity-50'
            }`}
            title={isAtLimit ? "Monthly message limit reached" : "Send message"}
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
      </form>

      {/* Upgrade Dialog */}
      <MessageActivationPackages
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        userRole={otherUser.role === 'client' ? 'owner' : 'client'}
      />

      {/* Profile/Listing Preview Sheet */}
      <ChatPreviewSheet
        isOpen={showPreviewSheet}
        onClose={() => setShowPreviewSheet(false)}
        otherUser={otherUser}
        listing={listing}
        currentUserRole={currentUserRole}
      />
    </Card>
  );
});

MessagingInterface.displayName = 'MessagingInterface';
