import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { PremiumSubscriptionManager } from '@/components/PremiumSubscriptionManager';
import { SupportButton } from '@/components/SupportButton';

import { MatchCelebration } from '@/components/MatchCelebration';
import { DashboardLayout } from '@/components/DashboardLayout';
import { NotificationBar } from '@/components/NotificationBar';
import { CategorySelectionDialog } from '@/components/CategorySelectionDialog';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useUserSubscription } from '@/hooks/useSubscription';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { NotificationSystem } from '@/components/NotificationSystem';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Home, 
  Zap, 
  TrendingUp, 
  Star, 
  Filter,
  MessageCircle,
  Settings,
  Crown,
  Eye,
  Plus,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

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
  const { data: subscription } = useUserSubscription();
  const { notifications, dismissNotification, markAllAsRead, handleNotificationClick } = useNotificationSystem();
  
  // Initialize notifications
  useNotifications();

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout userRole="owner">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Loading client profiles...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
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
    console.log('Client tapped:', clientId);
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

  const handleMatchCelebration = (clientProfile: any, ownerProfile: any) => {
    setMatchCelebration({
      isOpen: true,
      clientProfile,
      ownerProfile
    });
  };

  const handleStartConversation = () => {
    // Navigate to messaging or implement conversation start
    console.log('Starting conversation...');
  };

  const handleCategorySelect = (category: 'property' | 'yacht' | 'motorcycle' | 'bicycle', mode: 'rent' | 'sale' | 'both') => {
    navigate(`/owner/properties#add-${category}`);
  };

  const selectedClient = clientProfiles.find(c => c.user_id === selectedClientId);
  const hasPremium = subscription?.is_active;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <DashboardLayout userRole="owner">
      <NotificationSystem />
      <NotificationBar
        notifications={notifications}
        onDismiss={dismissNotification}
        onMarkAllRead={markAllAsRead}
        onNotificationClick={handleNotificationClick}
      />
      <div className="w-full min-h-screen bg-background">
        <motion.div 
          className="w-full h-full px-0 py-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Content - Fullscreen Swipe Card */}
          <div className="w-full h-full flex items-center justify-center">
            <motion.div variants={itemVariants} className="w-full h-full max-w-4xl">
              <ClientSwipeContainer 
                onClientTap={handleClientTap} 
                onInsights={handleInsights}
                onMessageClick={onMessageClick}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

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