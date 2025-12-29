import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { MatchCelebration } from '@/components/MatchCelebration';
import { DashboardLayout } from '@/components/DashboardLayout';
import { NotificationBar } from '@/components/NotificationBar';
import { CategorySelectionDialog } from '@/components/CategorySelectionDialog';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { NotificationSystem } from '@/components/NotificationSystem';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

interface EnhancedOwnerDashboardProps {
  onClientInsights?: (clientId: string) => void;
  onMessageClick?: () => void;
}

const EnhancedOwnerDashboard = ({ onClientInsights, onMessageClick }: EnhancedOwnerDashboardProps) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });
  
  const navigate = useNavigate();
  const { data: clientProfiles = [], isLoading, error, refetch } = useSmartClientMatching();
  const { notifications, dismissNotification, markAllAsRead, handleNotificationClick } = useNotificationSystem();
  
  // Initialize notifications
  useNotifications();

  // Show loading state - Use a simpler loading state to reduce flickering
  if (isLoading) {
    return (
      <DashboardLayout userRole="owner">
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading profiles...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout userRole="owner">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Card className="p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold mb-2">Unable to Load Clients</h3>
              <p className="text-muted-foreground mb-6">
                We're having trouble loading client profiles. Please try again.
              </p>
              <Button onClick={() => refetch()} size="lg" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const handleClientTap = (clientId: string) => {
    setSelectedClientId(clientId);
    setInsightsOpen(true);
  };

  const handleInsights = (clientId: string) => {
    setSelectedClientId(clientId);
    setInsightsOpen(true);
    if (onClientInsights) {
      onClientInsights(clientId);
    }
  };

  const handleStartConversation = () => {
    navigate('/messages');
  };

  const handleCategorySelect = (category: 'property' | 'yacht' | 'motorcycle' | 'bicycle', mode: 'rent' | 'sale' | 'both') => {
    navigate(`/owner/properties#add-${category}`);
  };

  const selectedClient = clientProfiles.find(c => c.user_id === selectedClientId);

  return (
    <DashboardLayout userRole="owner">
      <NotificationSystem />
      <NotificationBar
        notifications={notifications}
        onDismiss={dismissNotification}
        onMarkAllRead={markAllAsRead}
        onNotificationClick={handleNotificationClick}
      />
      <ClientSwipeContainer
        onClientTap={handleClientTap}
        onInsights={handleInsights}
        onMessageClick={onMessageClick}
        insightsOpen={insightsOpen}
      />

      {selectedClient && (
        <ClientInsightsDialog
          open={insightsOpen}
          onOpenChange={setInsightsOpen}
          profile={selectedClient}
        />
      )}

      <MatchCelebration
        isOpen={matchCelebration.isOpen}
        onClose={() => setMatchCelebration({ isOpen: false })}
        matchedUser={{
          name: matchCelebration.clientProfile?.name || 'User',
          avatar: matchCelebration.clientProfile?.images?.[0],
          role: 'client'
        }}
        onMessage={handleStartConversation}
      />

      <CategorySelectionDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onCategorySelect={handleCategorySelect}
      />
    </DashboardLayout>
  );
};

export default EnhancedOwnerDashboard;