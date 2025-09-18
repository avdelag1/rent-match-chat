import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { PremiumSubscriptionManager } from '@/components/PremiumSubscriptionManager';
import { LocationBasedMatching } from '@/components/LocationBasedMatching';
import { MatchCelebration } from '@/components/MatchCelebration';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useClientProfiles } from '@/hooks/useClientProfiles';
import { useUserSubscription } from '@/hooks/useSubscription';
import { useNotifications } from '@/hooks/useNotifications';
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
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });
  
  const { data: clientProfiles = [] } = useClientProfiles();
  const { data: subscription } = useUserSubscription();
  
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
      <motion.div 
        className="p-4 md:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Browse Clients
              </h1>
              <p className="text-muted-foreground">
                Explore verified client profiles and connect with potential matches
              </p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="w-full">
            
            {/* Swipe Section */}
            <motion.div variants={itemVariants} className="w-full">
              <Card className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      <Zap className="w-3 h-3 mr-1" />
                      Smart Matching
                    </Badge>
                    <Badge variant="outline" className="border-secondary/50 text-secondary">
                      <Filter className="w-3 h-3 mr-1" />
                      Client Filters
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowLocationMatching(!showLocationMatching)}
                      className="border-primary/50 text-primary hover:bg-primary/10"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {showLocationMatching ? 'Hide Location' : 'Show Nearby'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center pb-8">
                  {clientProfiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                      <Users className="w-16 h-16 text-muted-foreground/40" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">No Clients Available</h3>
                        <p className="text-muted-foreground text-sm max-w-sm">
                          Client profiles will appear here once users complete their onboarding. Check back soon!
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                        <Button size="sm">
                          Add Properties
                        </Button>
                      </div>
                    </div>
                  ) : showLocationMatching ? (
                    <LocationBasedMatching />
                  ) : (
                    <ClientSwipeContainer 
                      onClientTap={handleClientTap} 
                      onInsights={handleInsights}
                      onMessageClick={onMessageClick}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </motion.div>

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
        clientProfile={matchCelebration.clientProfile}
        ownerProfile={matchCelebration.ownerProfile}
        onStartConversation={handleStartConversation}
      />
    </DashboardLayout>
  );
};

export default EnhancedOwnerDashboard;