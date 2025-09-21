import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SwipeContainer } from '@/components/SwipeContainer';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { PremiumSubscriptionManager } from '@/components/PremiumSubscriptionManager';
import { DashboardLayout } from '@/components/DashboardLayout';
import { NotificationBar } from '@/components/NotificationBar';
import { useListings } from '@/hooks/useListings';
import { useUserSubscription } from '@/hooks/useSubscription';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useLocationBasedMatching } from '@/hooks/useLocationBasedMatching';
import { 
  Flame, 
  Home, 
  Zap, 
  TrendingUp, 
  Star, 
  Filter,
  MessageCircle,
  Settings,
  Crown,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
  locationFilter?: {
    latitude: number;
    longitude: number;
    city?: string;
    radius: number;
  } | null;
}

const EnhancedClientDashboard = ({ onPropertyInsights, onMessageClick, locationFilter }: EnhancedClientDashboardProps) => {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const { data: listings = [] } = useListings();
  const { data: subscription } = useUserSubscription();
  const { notifications, dismissNotification, markAllAsRead, handleNotificationClick } = useNotificationSystem();

  const handleListingTap = (listingId: string) => {
    console.log('Listing tapped:', listingId);
    setSelectedListingId(listingId);
    setInsightsOpen(true);
  };

  const handleInsights = (listingId: string) => {
    setSelectedListingId(listingId);
    setInsightsOpen(true);
    if (onPropertyInsights) {
      onPropertyInsights(listingId);
    }
  };

  const selectedListing = listings.find(l => l.id === selectedListingId);
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
    <DashboardLayout userRole="client">
      <NotificationBar
        notifications={notifications}
        onDismiss={dismissNotification}
        onMarkAllRead={markAllAsRead}
        onNotificationClick={handleNotificationClick}
      />
      <motion.div 
        className="p-2 sm:p-4 md:p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto">{/* removed empty div */}
          {/* Header - Compact for mobile */}
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                Find Your Dream Home
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Swipe through properties that match your preferences
              </p>
            </div>
          </motion.div>


          {/* Main Content - Mobile First */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            
            {/* Swipe Section - Full width on mobile, larger on desktop */}
            <motion.div variants={itemVariants} className="flex-1 lg:flex-[2]">
              <Card className="overflow-hidden shadow-lg">
                <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Smart Matching
                    </Badge>
                    {hasPremium && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center pb-4 sm:pb-8 px-2 sm:px-6">
                  <SwipeContainer 
                    onListingTap={handleListingTap} 
                    onInsights={handleInsights}
                    onMessageClick={onMessageClick}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar - Hidden on mobile, shown on desktop */}
            <motion.div variants={itemVariants} className="hidden lg:block lg:flex-1 space-y-4">
              
              {/* Premium Subscription */}
              <PremiumSubscriptionManager userRole="client" />

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full justify-start gap-2 text-sm" 
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Navigate to liked properties */}}
                  >
                    <Flame className="w-4 h-4 text-red-400" />
                    Liked Properties
                  </Button>
                  
                  <Button 
                    className="w-full justify-start gap-2 text-sm" 
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Navigate to messages */}}
                  >
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    Messages
                  </Button>
                  
                  <Button 
                    className="w-full justify-start gap-2 text-sm" 
                    variant="outline"
                    size="sm"
                    onClick={() => {/* Open filters */}}
                  >
                    <Filter className="w-4 h-4 text-green-400" />
                    Filters
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Features Teaser */}
              {!hasPremium && (
                <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10">
                  <CardContent className="p-3 text-center space-y-2">
                    <Crown className="w-6 h-6 mx-auto text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">Unlock Premium</h3>
                      <p className="text-xs text-muted-foreground">
                        Get premium features
                      </p>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Star className="w-3 h-3 text-yellow-400" />
                        Super Likes
                      </div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Eye className="w-3 h-3 text-blue-400" />
                        See Who Liked You
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white text-xs"
                      onClick={() => {/* Open subscription manager */}}
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <PropertyInsightsDialog
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
        listing={selectedListing || null}
      />
    </DashboardLayout>
  );
};

export default EnhancedClientDashboard;