import { PageTransition } from '@/components/PageTransition';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Search, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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
  const [userRole, setUserRole] = useState<'client' | 'owner'>('client');
  const [directConversationId, setDirectConversationId] = useState<string | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const { data: conversations = [], isLoading, refetch, ensureConversationInCache } = useConversations();
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

  // Get user role
  useEffect(() => {
    const getUserRole = async () => {
      if (!user?.id) return;

      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        setUserRole(roleData?.role || user?.user_metadata?.role || 'client');
      } catch (error) {
        console.error('Error getting user role:', error);
      }
    };

    getUserRole();
  }, [user?.id]);

  // Mark messages as read when viewing conversation
  useMarkMessagesAsRead(selectedConversationId || '', !!selectedConversationId);

  const filteredConversations = conversations.filter(conv =>
    conv.other_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
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
      supabase.removeChannel(conversationsChannel);
    };
  }, [user?.id, debouncedRefetch]);

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
  }, [searchParams]);

  const handleDirectOpenConversation = async (conversationId: string) => {
    setIsStartingConversation(true);

    try {
      // Try to find conversation in current list
      let conversation = conversations.find(c => c.id === conversationId);

      // If not found, refetch immediately to get latest data
      if (!conversation) {
        await refetch();
        conversation = conversations.find(c => c.id === conversationId);
      }

      if (conversation) {
        setSelectedConversationId(conversationId);
        setSearchParams({});
        toast({
          title: '✅ Conversation opened',
          description: 'You can now send messages!',
        });
      } else {
        // Even if we don't find it in the list, try to open it directly
        // The MessagingInterface will handle fetching the messages
        setSelectedConversationId(conversationId);
        setSearchParams({});
      }
    } catch (error) {
      console.error('[MessagingDashboard] Error opening conversation:', error);
      toast({
        title: '❌ Could not open conversation',
        description: 'The conversation may not exist. Try refreshing the page.',
        variant: 'destructive',
      });
      setSearchParams({});
    } finally {
      setIsStartingConversation(false);
    }
  };

  const handleAutoStartConversation = async (userId: string) => {
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
        setTimeout(async () => {
          await refetch();
          setSelectedConversationId(result.conversationId);
          setSearchParams({});
          toast({
            title: 'Conversation started',
            description: 'You can now send messages!',
          });
          setIsStartingConversation(false);
        }, 500);
      }
    } catch (error: any) {
      console.error('Error auto-starting conversation:', error);
      
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
  };

  if (selectedConversationId) {
    // If we have a selected conversation ID, show the messaging interface
    // If it's not in the full list yet, the MessagingInterface will handle fetching it
    const conversation = conversations.find(c => c.id === selectedConversationId);

    return (
      <DashboardLayout userRole={userRole}>
        <div className="h-full flex flex-col overflow-hidden">
          <div className="flex-1 w-full max-w-4xl mx-auto p-2 sm:p-4 flex flex-col min-h-0">
            {conversation?.other_user ? (
              <MessagingInterface
                conversationId={selectedConversationId}
                otherUser={conversation.other_user}
                onBack={() => {
                  setSelectedConversationId(null);
                  setDirectConversationId(null);
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
      <div className="w-full h-full overflow-y-auto pb-24">
        <div className="w-full max-w-4xl mx-auto p-2 sm:p-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-3xl font-bold">Messages</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Stay connected with your matches</p>
              </div>
            </div>
            {stats && (
              <Card className="px-3 py-2 sm:px-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-medium">Conversations This Week</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.conversationsUsed}/{stats.isPremium ? '∞' : 5} used
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-6">
            {/* Conversations List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversations
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[60vh] sm:h-[500px]">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                      <p className="text-muted-foreground">Loading conversations...</p>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedConversationId(conversation.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conversation.other_user?.avatar_url} />
                            <AvatarFallback>
                              {conversation.other_user?.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold truncate">
                                {conversation.other_user?.full_name || 'Unknown User'}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                {conversation.last_message_at
                                  ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                                  : 'No messages'
                                }
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-muted-foreground truncate">
                                {conversation.last_message?.message_text || 'Start a conversation...'}
                              </p>
                            </div>
                            <Badge
                              variant={conversation.other_user?.role === 'client' ? 'default' : 'secondary'}
                              className="mt-2"
                            >
                              {conversation.other_user?.role === 'client' ? 'Client' : 'Property Owner'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No conversations found' : 'No conversations yet'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {searchQuery ? 'Try a different search term' : 'Start matching to begin conversations!'}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
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