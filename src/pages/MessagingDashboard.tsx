
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isFromMe: boolean;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
}

const MessagingDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock data - in real app this would come from API
  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'María González',
      lastMessage: 'Thanks for the property tour!',
      timestamp: '2 min ago',
      unreadCount: 2,
      avatar: 'MG'
    },
    {
      id: '2',
      name: 'Carlos Ruiz',
      lastMessage: 'Is the apartment still available?',
      timestamp: '1 hour ago',
      unreadCount: 0,
      avatar: 'CR'
    },
    {
      id: '3',
      name: 'Ana López',
      lastMessage: 'Perfect, I\'ll take it!',
      timestamp: '3 hours ago',
      unreadCount: 1,
      avatar: 'AL'
    }
  ];

  const messages: Record<string, Message[]> = {
    '1': [
      {
        id: '1',
        text: 'Hi! I\'m interested in your property listing.',
        timestamp: '10:30 AM',
        isFromMe: false
      },
      {
        id: '2',
        text: 'Hello! I\'d be happy to show you the property. When would be a good time?',
        timestamp: '10:35 AM',
        isFromMe: true
      },
      {
        id: '3',
        text: 'Thanks for the property tour!',
        timestamp: '11:00 AM',
        isFromMe: false
      }
    ]
  };

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

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white">Messages</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${
                      selectedConversation === conv.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-white/20 text-white">
                          {conv.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white truncate">
                            {conv.name}
                          </h3>
                          <span className="text-xs text-white/60">
                            {conv.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <div className="md:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="border-b border-white/10">
                    <CardTitle className="text-white">
                      {conversations.find(c => c.id === selectedConversation)?.name}
                    </CardTitle>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[400px] p-4">
                      <div className="space-y-4">
                        {(messages[selectedConversation] || []).map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.isFromMe
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white/20 text-white'
                              }`}
                            >
                              <p className="text-sm">{message.text}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white/70">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start messaging</p>
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
