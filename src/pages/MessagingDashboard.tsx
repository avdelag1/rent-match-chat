
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, ArrowLeft, Search, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromMe: boolean;
  type?: 'text' | 'image' | 'file';
  status?: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  isOnline: boolean;
  type: 'property_inquiry' | 'match' | 'support';
}

const MessagingDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced mock data with more conversations
  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'María González',
      lastMessage: 'Thanks for the property tour! When can we schedule the lease signing?',
      timestamp: '2 min ago',
      unreadCount: 2,
      avatar: 'MG',
      isOnline: true,
      type: 'property_inquiry'
    },
    {
      id: '2',
      name: 'Carlos Ruiz',
      lastMessage: 'Is the apartment still available? I\'m very interested.',
      timestamp: '1 hour ago',
      unreadCount: 0,
      avatar: 'CR',
      isOnline: false,
      type: 'match'
    },
    {
      id: '3',
      name: 'Ana López',
      lastMessage: 'Perfect, I\'ll take it! Can you send me the contract details?',
      timestamp: '3 hours ago',
      unreadCount: 1,
      avatar: 'AL',
      isOnline: true,
      type: 'property_inquiry'
    },
    {
      id: '4',
      name: 'David Chen',
      lastMessage: 'The location looks perfect for my remote work setup.',
      timestamp: '1 day ago',
      unreadCount: 0,
      avatar: 'DC',
      isOnline: false,
      type: 'match'
    },
    {
      id: '5',
      name: 'Sofia Martinez',
      lastMessage: 'Could you tell me more about the amenities?',
      timestamp: '2 days ago',
      unreadCount: 3,
      avatar: 'SM',
      isOnline: true,
      type: 'property_inquiry'
    },
    {
      id: '6',
      name: 'Support Team',
      lastMessage: 'Your subscription has been updated successfully.',
      timestamp: '1 week ago',
      unreadCount: 0,
      avatar: 'ST',
      isOnline: true,
      type: 'support'
    }
  ];

  // Enhanced messages with more content
  const messages: Record<string, Message[]> = {
    '1': [
      {
        id: '1',
        text: 'Hi! I\'m interested in your property listing on Aldea Zama.',
        timestamp: '10:30 AM',
        isFromMe: false,
        status: 'read'
      },
      {
        id: '2',
        text: 'Hello María! I\'d be happy to show you the property. It\'s a beautiful 2-bedroom apartment with cenote access.',
        timestamp: '10:35 AM',
        isFromMe: true,
        status: 'read'
      },
      {
        id: '3',
        text: 'That sounds amazing! I\'m particularly interested in the coworking space and gym facilities.',
        timestamp: '10:37 AM',
        isFromMe: false,
        status: 'read'
      },
      {
        id: '4',
        text: 'Absolutely! The coworking space has high-speed internet and the gym is open 24/7. When would be a good time for a tour?',
        timestamp: '10:40 AM',
        isFromMe: true,
        status: 'read'
      },
      {
        id: '5',
        text: 'How about tomorrow afternoon around 3 PM?',
        timestamp: '10:45 AM',
        isFromMe: false,
        status: 'read'
      },
      {
        id: '6',
        text: 'Perfect! I\'ll meet you at the property entrance tomorrow at 3 PM. I\'ll send you the exact location.',
        timestamp: '10:50 AM',
        isFromMe: true,
        status: 'delivered'
      },
      {
        id: '7',
        text: 'Thanks for the property tour! When can we schedule the lease signing?',
        timestamp: '11:00 AM',
        isFromMe: false,
        status: 'sent'
      }
    ],
    '2': [
      {
        id: '1',
        text: 'Hello! I saw we matched on your property listing.',
        timestamp: '9:15 AM',
        isFromMe: false,
        status: 'read'
      },
      {
        id: '2',
        text: 'Hi Carlos! Yes, I saw your profile and think you\'d be a great fit for the property.',
        timestamp: '9:20 AM',
        isFromMe: true,
        status: 'read'
      },
      {
        id: '3',
        text: 'Is the apartment still available? I\'m very interested.',
        timestamp: '9:25 AM',
        isFromMe: false,
        status: 'read'
      }
    ]
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // Here you would add the message to the conversation
      setNewMessage('');
    }
  };

  const handleBackToDashboard = () => {
    const profile = user?.user_metadata;
    const role = profile?.role || 'client';
    navigate(role === 'owner' ? '/owner/dashboard' : '/client/dashboard');
  };

  const getConversationTypeColor = (type: string) => {
    switch (type) {
      case 'property_inquiry': return 'bg-blue-500';
      case 'match': return 'bg-green-500';
      case 'support': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBackToDashboard}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Messages</h1>
              <p className="text-white/70">Stay connected with your matches</p>
            </div>
          </div>
          <div className="text-white/60 text-sm">
            {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} unread messages
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Conversations
                  </CardTitle>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {conversations.length}
                  </Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${
                        selectedConversation === conv.id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-white/20 text-white font-semibold">
                              {conv.avatar}
                            </AvatarFallback>
                          </Avatar>
                          {conv.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-white truncate">
                              {conv.name}
                            </h3>
                            <span className="text-xs text-white/60 shrink-0">
                              {conv.timestamp}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${getConversationTypeColor(conv.type)}`} />
                            <span className="text-xs text-white/60 capitalize">
                              {conv.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-white/70 truncate mb-1">
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredConversations.length === 0 && (
                    <div className="p-8 text-center text-white/60">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No conversations found</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-full flex flex-col">
              {selectedConversation && selectedConv ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-white/20 text-white">
                              {selectedConv.avatar}
                            </AvatarFallback>
                          </Avatar>
                          {selectedConv.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{selectedConv.name}</h3>
                          <p className="text-white/60 text-sm">
                            {selectedConv.isOnline ? 'Online' : 'Last seen 2h ago'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full p-6">
                      <div className="space-y-4">
                        {(messages[selectedConversation] || []).map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                message.isFromMe
                                  ? 'bg-green-500 text-white rounded-br-md'
                                  : 'bg-white/20 text-white rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.text}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs opacity-70">
                                  {message.timestamp}
                                </p>
                                {message.isFromMe && message.status && (
                                  <span className="text-xs opacity-70">
                                    {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓' : '○'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10 shrink-0"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <div className="flex-1 relative">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-12"
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/10"
                        >
                          <Smile className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        className="bg-green-500 hover:bg-green-600 shrink-0"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white/70 p-8">
                    <MessageCircle className="w-16 h-16 mx-auto mb-6 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                    <p className="text-white/60">
                      Choose a conversation from the sidebar to start messaging
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingDashboard;
