import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { PremiumSubscriptionManager } from '@/components/PremiumSubscriptionManager';
import { SupportButton } from '@/components/SupportButton';
import { LocationBasedMatching } from '@/components/LocationBasedMatching';
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
  const [showLocationMatching, setShowLocationMatching] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });
  
  const navigate = useNavigate();
  const { data: clientProfiles = [] } = useSmartClientMatching();
  const { data: subscription } = useUserSubscription();
  const { notifications, dismissNotification, markAllAsRead, handleNotificationClick } = useNotificationSystem();
  
  // Initialize notifications
  useNotifications();

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
          className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-7xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
                Browse Clients
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Explore verified client profiles and connect with potential matches
              </p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="w-full">
            
            {/* Swipe Section */}
            <motion.div variants={itemVariants} className="w-full">
              <Card className="overflow-hidden">
                <CardHeader className="pb-4 px-3 sm:px-6">
                  <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                    <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Smart Matching
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowLocationMatching(!showLocationMatching)}
                      className="border-primary/50 text-primary hover:bg-primary/10 text-xs"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {showLocationMatching ? 'Hide Location' : 'Show Nearby'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center pb-6 sm:pb-8 px-3 sm:px-6">
                  {showLocationMatching ? (
                    <div className="w-full max-w-4xl">
                      <LocationBasedMatching />
                    </div>
                  ) : (
                    <div className="w-full max-w-4xl">
                      <ClientSwipeContainer 
                        onClientTap={handleClientTap} 
                        onInsights={handleInsights}
                        onMessageClick={onMessageClick}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
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