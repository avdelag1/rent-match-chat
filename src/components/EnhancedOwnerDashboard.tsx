import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { PremiumSubscriptionManager } from '@/components/PremiumSubscriptionManager';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useClientProfiles } from '@/hooks/useClientProfiles';
import { useUserSubscription } from '@/hooks/useSubscription';
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
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedOwnerDashboardProps {
  onClientInsights?: (clientId: string) => void;
  onMessageClick?: () => void;
}

const EnhancedOwnerDashboard = ({ onClientInsights, onMessageClick }: EnhancedOwnerDashboardProps) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const { data: clientProfiles = [] } = useClientProfiles();
  const { data: subscription } = useUserSubscription();

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
                Find Perfect Tenants
              </h1>
              <p className="text-muted-foreground">
                Swipe through verified tenant profiles for your properties
              </p>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{clientProfiles.length}</div>
                <div className="text-xs text-muted-foreground">Available Tenants</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">8</div>
                <div className="text-xs text-muted-foreground">Tenants Liked</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">5</div>
                <div className="text-xs text-muted-foreground">Active Matches</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  {hasPremium ? (
                    <>
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Premium</span>
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Free</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Plan Status</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <div className="w-full">
            
            {/* Swipe Section */}
            <motion.div variants={itemVariants} className="w-full">
              <Card className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      <Zap className="w-3 h-3 mr-1" />
                      Smart Matching
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center pb-8">
                  {clientProfiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                      <Users className="w-16 h-16 text-muted-foreground/40" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">No Tenants Available</h3>
                        <p className="text-muted-foreground text-sm max-w-sm">
                          Tenant profiles will appear here once users complete their onboarding. Check back soon!
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
    </DashboardLayout>
  );
};

export default EnhancedOwnerDashboard;