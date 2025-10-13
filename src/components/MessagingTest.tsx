import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStartConversation } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useMessagingQuota } from '@/hooks/useMessagingQuota';
import { MessageQuotaDialog } from '@/components/MessageQuotaDialog';
import { useState } from 'react';

export function MessagingTest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const startConversation = useStartConversation();
  const { canStartNewConversation } = useMessagingQuota();
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);

  const testUsers = [
    { id: '997d9507-2b29-4566-9a1c-eb0f10357e14', name: 'Client 1', role: 'client' },
    { id: '63c34301-8e40-403b-a09b-25c1298d1b8d', name: 'Owner 1', role: 'owner' },
    { id: 'e906f6ff-3281-487d-9c24-f6490297b2d6', name: 'Melissa Rice', role: 'client' }
  ];

  const handleStartTestConversation = (otherUserId: string, otherUserName: string) => {
    if (!canStartNewConversation) {
      setShowQuotaDialog(true);
      return;
    }

    startConversation.mutate({
      otherUserId,
      listingId: 'bb11772a-3cf4-4827-8359-d1f2f1349ed0',
      initialMessage: `Hi ${otherUserName}! I'm interested in discussing this property. Can we chat?`,
      canStartNewConversation
    }, {
      onSuccess: () => {
        navigate('/messages');
      },
      onError: (error: Error) => {
        if (error.message === 'QUOTA_EXCEEDED') {
          setShowQuotaDialog(true);
        }
      }
    });
  };

  const otherUsers = testUsers.filter(u => u.id !== user?.id);

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Messaging System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Start a test conversation with another user:
          </p>
          
          {otherUsers.map((testUser) => (
            <Button 
              key={testUser.id}
              onClick={() => handleStartTestConversation(testUser.id, testUser.name)}
              disabled={startConversation.isPending}
              className="w-full"
              variant="outline"
            >
              {startConversation.isPending ? 'Starting...' : `Message ${testUser.name} (${testUser.role})`}
            </Button>
          ))}
          
          <Button 
            onClick={() => navigate('/messages')} 
            className="w-full"
          >
            Go to Messages
          </Button>
        </CardContent>
      </Card>

      <MessageQuotaDialog
        isOpen={showQuotaDialog}
        onClose={() => setShowQuotaDialog(false)}
        onUpgrade={() => {
          setShowQuotaDialog(false);
          navigate('/subscription-packages');
        }}
        userRole={'client'}
      />
    </>
  );
}