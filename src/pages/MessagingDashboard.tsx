import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, Search, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConversations, useConversationStats } from '@/hooks/useConversations';
import { MessagingInterface } from '@/components/MessagingInterface';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export function MessagingDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: conversations = [], isLoading } = useConversations();
  const { data: stats } = useConversationStats();

  const filteredConversations = conversations.filter(conv =>
    conv.other_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);

  const handleBackToDashboard = () => {
    // Get user role from profile data via auth hook
    const getUserRole = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user?.id)
          .maybeSingle();
        
        const role = profile?.role || user?.user_metadata?.role || 'client';
        if (role === 'owner') {
          navigate('/owner/dashboard');
        } else {
          navigate('/client/dashboard');
        }
      } catch (error) {
        console.error('Error getting user role:', error);
        navigate('/client/dashboard'); // Default fallback
      }
    };
    
    getUserRole();
  };

  if (selectedConversation && selectedConversation.other_user) {
    return (
      <div className="container mx-auto p-4 max-w-6xl h-[calc(100vh-2rem)] flex flex-col">
        <MessagingInterface
          conversationId={selectedConversation.id}
          otherUser={selectedConversation.other_user}
          onBack={() => setSelectedConversationId(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">Stay connected with your matches</p>
          </div>
        </div>
        {stats && (
          <Card className="px-4 py-2">
            <div className="text-center">
              <p className="text-sm font-medium">Conversations This Week</p>
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
            <ScrollArea className="h-[500px]">
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
  );
}