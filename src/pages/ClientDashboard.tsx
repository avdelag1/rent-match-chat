
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, Heart, MessageCircle, User, CreditCard } from 'lucide-react';
import { SwipeContainer } from '@/components/SwipeContainer';
import { PropertyDetails } from '@/components/PropertyDetails';
import { SubscriptionPackages } from '@/components/SubscriptionPackages';
import { useUserSubscription, useHasPremiumFeature } from '@/hooks/useSubscription';

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const { data: subscription } = useUserSubscription();
  const hasMessaging = useHasPremiumFeature('messaging');
  
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showSubscriptionPackages, setShowSubscriptionPackages] = useState(false);
  const [subscriptionReason, setSubscriptionReason] = useState<string>('');

  const handleListingTap = (listingId: string) => {
    setSelectedListingId(listingId);
    setShowPropertyDetails(true);
  };

  const handleMessageClick = () => {
    if (!hasMessaging) {
      setSubscriptionReason('Unlock messaging to connect with property owners!');
      setShowSubscriptionPackages(true);
    } else {
      // Navigate to messages
      console.log('Navigate to messages');
    }
  };

  const handleSubscriptionClick = () => {
    setSubscriptionReason('Choose the perfect plan for your rental search!');
    setShowSubscriptionPackages(true);
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Tinderent</h1>
              <Badge variant="secondary" className="bg-white/20 text-white">
                Client
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {subscription ? (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  {subscription.subscription_packages?.name}
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSubscriptionClick}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Swipe Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  Discover Your Perfect Home
                </CardTitle>
                <p className="text-white/80 text-center text-sm">
                  Swipe right to like, left to pass, or tap for details
                </p>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <SwipeContainer onListingTap={handleListingTap} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white">
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-sm text-white/80 mt-1">Client Account</p>
                  {subscription ? (
                    <Badge className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500">
                      Premium Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-2 border-white/30 text-white">
                      Free Account
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={handleMessageClick}
                  disabled={!hasMessaging}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages {!hasMessaging && '(Premium)'}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Liked Properties
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Subscription Info */}
            {!subscription && (
              <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-purple-300/30">
                <CardHeader>
                  <CardTitle className="text-white">Unlock Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90 text-sm mb-4">
                    Get unlimited messaging, advanced filters, and priority support!
                  </p>
                  <Button
                    onClick={handleSubscriptionClick}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  >
                    View Plans
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Property Details Modal */}
      <PropertyDetails
        listingId={selectedListingId}
        isOpen={showPropertyDetails}
        onClose={() => {
          setShowPropertyDetails(false);
          setSelectedListingId(null);
        }}
        onMessageClick={handleMessageClick}
      />

      {/* Subscription Packages Modal */}
      <SubscriptionPackages
        isOpen={showSubscriptionPackages}
        onClose={() => setShowSubscriptionPackages(false)}
        reason={subscriptionReason}
      />
    </div>
  );
};

export default ClientDashboard;
