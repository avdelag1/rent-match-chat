import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SwipeContainer } from '@/components/SwipeContainer';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { PremiumSubscriptionManager } from '@/components/PremiumSubscriptionManager';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useListings } from '@/hooks/useListings';
import { useUserSubscription } from '@/hooks/useSubscription';
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
}

const EnhancedClientDashboard = ({ onPropertyInsights, onMessageClick }: EnhancedClientDashboardProps) => {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const { data: listings = [] } = useListings();
  const { data: subscription } = useUserSubscription();

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
      <motion.div 
        className="p-4 md:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Discover Your Dream Home
              </h1>
              <p className="text-muted-foreground">
                Swipe through curated properties that match your preferences
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{listings.length}</div>
                <div className="text-xs text-muted-foreground">Available Properties</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">12</div>
                <div className="text-xs text-muted-foreground">Properties Liked</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">3</div>
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

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Swipe Section */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Home className="w-5 h-5 text-primary" />
                    Property Discovery
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      <Zap className="w-3 h-3 mr-1" />
                      Smart Matching
                    </Badge>
                    {hasPremium && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center pb-8">
                  <SwipeContainer 
                    onListingTap={handleListingTap} 
                    onInsights={handleInsights}
                    onMessageClick={onMessageClick}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div variants={itemVariants} className="space-y-6">
              
              {/* Premium Subscription */}
              <PremiumSubscriptionManager userRole="client" />

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start gap-2" 
                    variant="outline"
                    onClick={() => {/* Navigate to liked properties */}}
                  >
                    <Flame className="w-4 h-4 text-red-400" />
                    View Liked Properties
                  </Button>
                  
                  <Button 
                    className="w-full justify-start gap-2" 
                    variant="outline"
                    onClick={() => {/* Navigate to messages */}}
                  >
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    Messages
                  </Button>
                  
                  <Button 
                    className="w-full justify-start gap-2" 
                    variant="outline"
                    onClick={() => {/* Open filters */}}
                  >
                    <Filter className="w-4 h-4 text-green-400" />
                    Adjust Filters
                  </Button>
                  
                  <Button 
                    className="w-full justify-start gap-2" 
                    variant="outline"
                    onClick={() => {/* View insights */}}
                  >
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    My Insights
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Features Teaser */}
              {!hasPremium && (
                <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10">
                  <CardContent className="p-4 text-center space-y-3">
                    <Crown className="w-8 h-8 mx-auto text-primary animate-pulse-glow" />
                    <div>
                      <h3 className="font-semibold text-foreground">Unlock Premium</h3>
                      <p className="text-xs text-muted-foreground">
                        Get 10x better results with premium features
                      </p>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Star className="w-3 h-3 text-yellow-400" />
                        Unlimited Super Likes
                      </div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Eye className="w-3 h-3 text-blue-400" />
                        See Who Liked You
                      </div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        Priority Matching
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white"
                      onClick={() => {/* Open subscription manager */}}
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      Upgrade Now
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