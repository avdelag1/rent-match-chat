import { PageTransition } from '@/components/PageTransition';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Search, Plus, Home, Bike, Ship, Car } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useConversations, useConversationStats, useStartConversation } from '@/hooks/useConversations';
import { useMarkMessagesAsRead } from '@/hooks/useMarkMessagesAsRead';
import { MessagingInterface } from '@/components/MessagingInterface';
import { formatDistanceToNow } from '@/utils/timeFormatter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MessageActivationPackages } from '@/components/MessageActivationPackages';
import { useMessageActivations } from '@/hooks/useMessageActivations';

export function MessagingDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [directConversationId, setDirectConversationId] = useState<string | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Use React Query-based hook for role - prevents menu flickering
  const { data: fetchedRole, isLoading: roleLoading } = useUserRole(user?.id);
  const userRole = fetchedRole || 'client';

  const { data: conversations = [], isLoading, refetch, ensureConversationInCache, fetchSingleConversation } = useConversations();
  // State to store a directly fetched conversation (when not in cache)
  const [directlyFetchedConversation, setDirectlyFetchedConversation] = useState<{
    id: string;
    other_user?: { id: string; full_name: string; avatar_url?: string; role: string };
    listing?: { id: string; title: string; price?: number; images?: string[]; category?: string; mode?: string; address?: string; city?: string };
  } | null>(null);
  const { data: stats } = useConversationStats();
  const startConversation = useStartConversation();
  const { totalActivations, canSendMessage } = useMessageActivations();

  // Debounced refetch to prevent excessive queries on rapid real-time events
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedRefetch = useCallback(() => {
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }
    refetchTimeoutRef.current = setTimeout(() => {
      refetch();
    }, 500); // 500ms debounce for smoother real-time updates
  }, [refetch]);


  // Mark messages as read when viewing conversation
  useMarkMessagesAsRead(selectedConversationId || '', !!selectedConversationId);

  const filteredConversations = useMemo(() =>
    conversations.filter(conv =>
      conv.other_user?.full_name?.toLowerCase()?.includes(searchQuery.toLowerCase())
    ),
    [conversations, searchQuery]
  );

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);

  // Realtime subscription for new conversations
  useEffect(() => {
    if (!user?.id) return;

    const conversationsChannel = supabase
      .channel(`conversations-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `or(client_id.eq.${user.id},owner_id.eq.${user.id})`
        },
        (payload) => {
          // Debounced refetch for smoother real-time updates
          debouncedRefetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `or(client_id.eq.${user.id},owner_id.eq.${user.id})`
        },
        (payload) => {
          // Debounced refetch for smoother real-time updates
          debouncedRefetch();
        }
      )
      .subscribe();

    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
      // Properly unsubscribe before removing channel
      conversationsChannel.unsubscribe();
    };
  }, [user?.id, debouncedRefetch]);

  // Memoized handlers for conversation opening
  const handleDirectOpenConversation = useCallback(async (conversationId: string) => {
    setIsStartingConversation(true);
    setDirectlyFetchedConversation(null); // Reset any previously fetched conversation

    try {
      // Try to find conversation in current list
      let conversation = conversations.find(c => c.id === conversationId);

      // If not found, refetch immediately to get latest data
      if (!conversation) {
        const result = await refetch();
        // Use fresh data from refetch result instead of stale state
        const freshConversations = result.data || [];
        conversation = freshConversations.find((c: { id: string }) => c.id === conversationId);
      }

      if (conversation) {
        setSelectedConversationId(conversationId);
        setSearchParams({});
        toast({
          title: '✅ Conversation opened',
          description: 'You can now send messages!',
        });
      } else {
        // Conversation not in cache - fetch it directly from database
        const fetchedConversation = await fetchSingleConversation(conversationId);

        if (fetchedConversation && fetchedConversation.other_user) {
          setDirectlyFetchedConversation(fetchedConversation);
          setSelectedConversationId(conversationId);
          setSearchParams({});
          toast({
            title: '✅ Conversation opened',
            description: 'You can now send messages!',
          });
        } else {
          // Still couldn't find it - show error
          toast({
            title: '❌ Could not open conversation',
            description: 'The conversation may not exist. Try refreshing the page.',
            variant: 'destructive',
          });
          setSearchParams({});
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('[MessagingDashboard] Error opening conversation:', error);
      toast({
        title: '❌ Could not open conversation',
        description: 'The conversation may not exist. Try refreshing the page.',
        variant: 'destructive',
      });
      setSearchParams({});
    } finally {
      setIsStartingConversation(false);
    }
  }, [conversations, refetch, fetchSingleConversation, setSearchParams]);

  const handleAutoStartConversation = useCallback(async (userId: string) => {
    setIsStartingConversation(true);

    try {
      // Check if conversation already exists
      const existingConv = conversations.find(c =>
        c.other_user?.id === userId
      );

      if (existingConv) {
        toast({
          title: 'Opening conversation',
          description: 'Loading your existing conversation...',
        });
        setSelectedConversationId(existingConv.id);
        setSearchParams({}); // Clear URL param
        setIsStartingConversation(false);
        return;
      }

      // Check if user has activations
      if (!canSendMessage || totalActivations === 0) {
        setShowUpgradeDialog(true);
        setSearchParams({}); // Clear URL param
        setIsStartingConversation(false);
        return;
      }

      // Create new conversation
      toast({
        title: 'Starting conversation',
        description: 'Creating a new conversation...',
      });

      const result = await startConversation.mutateAsync({
        otherUserId: userId,
        initialMessage: "Hi! I'm interested in connecting.",
        canStartNewConversation: canSendMessage,
      });

      if (result.conversationId) {
        // Wait a moment for the conversation to be available
        await new Promise(resolve => setTimeout(resolve, 500));
        await refetch();
        setSelectedConversationId(result.conversationId);
        setSearchParams({});
        toast({
          title: 'Conversation started',
          description: 'You can now send messages!',
        });
        setIsStartingConversation(false);
      }
    } catch (error: any) {
      if (import.meta.env.DEV) console.error('Error auto-starting conversation:', error);

      if (error?.message === 'QUOTA_EXCEEDED') {
        setShowUpgradeDialog(true);
      } else {
        toast({
          title: 'Could not start conversation',
          description: error instanceof Error ? error.message : 'Please try again later.',
          variant: 'destructive',
        });
      }

      setSearchParams({});
      setIsStartingConversation(false);
    }
  }, [conversations, canSendMessage, totalActivations, startConversation, refetch, setSearchParams]);

  // Handle direct conversation opening or auto-start from URL parameters
  useEffect(() => {
    const conversationId = searchParams.get('conversationId');
    const startConversationUserId = searchParams.get('startConversation');

    // Store direct conversation ID for priority display
    if (conversationId) {
      setDirectConversationId(conversationId);
    }

    // Direct conversation ID - open immediately
    if (conversationId && !isStartingConversation) {
      handleDirectOpenConversation(conversationId);
    }
    // User ID - start new conversation
    else if (startConversationUserId && !isStartingConversation) {
      handleAutoStartConversation(startConversationUserId);
    }
  }, [searchParams, isStartingConversation, handleDirectOpenConversation, handleAutoStartConversation]);

  // Show loading state while role is being fetched to prevent menu flickering
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#000000]">
        <div className="flex flex-col items-center gap-4">
          <MessageCircle className="w-12 h-12 text-[#007AFF] animate-pulse" />
          <p className="text-[#8E8E93]">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (selectedConversationId) {
    // If we have a selected conversation ID, show the messaging interface
    // Use either the cached conversation or the directly fetched one
    const conversation = conversations.find(c => c.id === selectedConversationId) || directlyFetchedConversation;

    // Get the other user from either source
    const otherUser = conversation?.other_user;
    const listing = conversation?.listing;

    return (
      <DashboardLayout userRole={userRole}>
        <div className="w-full flex flex-col pb-24">
          <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 flex flex-col">
            {otherUser ? (
              <MessagingInterface
                conversationId={selectedConversationId}
                otherUser={otherUser}
                listing={listing}
                currentUserRole={userRole}
                onBack={() => {
                  setSelectedConversationId(null);
                  setDirectConversationId(null);
                  setDirectlyFetchedConversation(null);
                }}
              />
            ) : (
              // Fallback: Show loading state while conversation details load
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <MessageCircle className="w-12 h-12 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground">Loading conversation...</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedConversationId(null);
                    setDirectConversationId(null);
                    setDirectlyFetchedConversation(null);
                  }}
                  className="mt-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="w-full pb-24 bg-[#000000]">
        <div className="w-full max-w-4xl mx-auto p-3 sm:p-4">
          {/* Vibrant Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="text-white hover:bg-white/10 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Messages</h1>
              </div>
              {stats && (
                <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF6B35]/20 to-[#F7931E]/20 border border-[#FF6B35]/30">
                  <p className="text-xs font-medium text-[#FF6B35]">
                    {stats.conversationsUsed}/{stats.isPremium ? '∞' : 5} this week
                  </p>
                </div>
              )}
            </div>
            <p className="text-sm text-[#8E8E93] ml-11">Stay connected with your matches</p>
          </div>

          {/* Conversations Section */}
          <div className="rounded-2xl bg-[#1C1C1E] overflow-hidden">
            {/* Section Header with Search */}
            <div className="p-4 border-b border-[#38383A]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-white">Conversations</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10 bg-[#2C2C2E] border-[#38383A] text-white placeholder:text-[#8E8E93] rounded-xl focus:border-[#007AFF] focus:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="h-[60vh] sm:h-[500px]">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#007AFF]/20 to-[#5856D6]/20 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-[#007AFF] animate-pulse" />
                  </div>
                  <p className="text-[#8E8E93]">Loading conversations...</p>
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conversation, index) => {
                  const isOwner = conversation.other_user?.role === 'owner';
                  const listing = conversation.listing;

                  const getCategoryIcon = (category?: string) => {
                    switch (category) {
                      case 'yacht': return <Ship className="w-3 h-3" />;
                      case 'motorcycle': return <Car className="w-3 h-3" />;
                      case 'bicycle': return <Bike className="w-3 h-3" />;
                      case 'vehicle': return <Car className="w-3 h-3" />;
                      default: return <Home className="w-3 h-3" />;
                    }
                  };

                  return (
                    <div
                      key={conversation.id}
                      className="p-4 border-b border-[#38383A] cursor-pointer hover:bg-[#2C2C2E] transition-all duration-200 active:scale-[0.98]"
                      onClick={() => setSelectedConversationId(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar with colored ring */}
                        <div className="relative shrink-0">
                          <Avatar className={`w-14 h-14 ring-2 ring-offset-2 ring-offset-[#1C1C1E] ${
                            isOwner ? 'ring-[#FF6B35]' : 'ring-[#007AFF]'
                          }`}>
                            <AvatarImage src={conversation.other_user?.avatar_url} />
                            <AvatarFallback className={`text-lg font-semibold text-white ${
                              isOwner
                                ? 'bg-gradient-to-br from-[#FF6B35] to-[#F7931E]'
                                : 'bg-gradient-to-br from-[#007AFF] to-[#5856D6]'
                            }`}>
                              {conversation.other_user?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online indicator */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#34C759] rounded-full border-2 border-[#1C1C1E]" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className="font-semibold text-white truncate text-[15px]">
                              {conversation.other_user?.full_name || 'Unknown User'}
                            </h3>
                            <span className="text-xs text-[#8E8E93] ml-2 shrink-0">
                              {conversation.last_message_at
                                ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: false })
                                : ''
                              }
                            </span>
                          </div>
                          <p className="text-sm text-[#8E8E93] truncate mb-2">
                            {conversation.last_message?.message_text || 'Start a conversation...'}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              className={`text-[10px] px-2 py-0.5 border-0 ${
                                isOwner
                                  ? 'bg-[#FF6B35]/20 text-[#FF6B35]'
                                  : 'bg-[#007AFF]/20 text-[#007AFF]'
                              }`}
                            >
                              {isOwner ? 'Property Owner' : 'Client'}
                            </Badge>
                            {/* Show listing info if available */}
                            {listing && userRole === 'client' && (
                              <Badge className="text-[10px] px-2 py-0.5 border-0 bg-[#34C759]/20 text-[#34C759] flex items-center gap-1">
                                {getCategoryIcon(listing.category)}
                                <span className="truncate max-w-[100px]">{listing.title}</span>
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Right side with price or chevron */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {listing && userRole === 'client' && listing.price && (
                            <span className="text-sm font-semibold text-[#34C759]">
                              ${listing.price.toLocaleString()}
                            </span>
                          )}
                          <div className="text-[#48484A]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#FF6B35]/20 to-[#F7931E]/20 flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-[#FF6B35]" />
                  </div>
                  <p className="text-white font-medium mb-1">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </p>
                  <p className="text-sm text-[#8E8E93]">
                    {searchQuery ? 'Try a different search term' : 'Start matching to begin conversations!'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <MessageActivationPackages
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        userRole={userRole}
      />
    </DashboardLayout>
  );
}