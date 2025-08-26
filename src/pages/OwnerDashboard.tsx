
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, User, Plus } from 'lucide-react';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { PropertyForm } from '@/components/PropertyForm';
import { SubscriptionPackages } from '@/components/SubscriptionPackages';
import { useUserSubscription } from '@/hooks/useSubscription';

const OwnerDashboard = () => {
  const { user, signOut } = useAuth();
  const { data: subscription } = useUserSubscription();
  
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showSubscriptionPackages, setShowSubscriptionPackages] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const handleProfileTap = (profileId: string) => {
    setSelectedProfileId(profileId);
    // TODO: Open profile details modal
    console.log('Profile tapped:', profileId);
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
                Owner
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {subscription ? (
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  {subscription.subscription_packages?.name}
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSubscriptionPackages(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Upgrade
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPropertyForm(true)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              
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
        {/* Main Swipe Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Discover Potential Tenants</h2>
          <p className="text-white/80 text-lg">Swipe through client profiles to find your ideal tenants</p>
        </div>

        {/* Swipe Container */}
        <div className="flex justify-center">
          <ClientSwipeContainer onProfileTap={handleProfileTap} />
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">List Property</h3>
            <p className="text-white/80 text-sm mb-4">Add your property to attract potential tenants</p>
            <Button
              onClick={() => setShowPropertyForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Add Property
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Preferences</h3>
            <p className="text-white/80 text-sm mb-4">Set your tenant preferences and filters</p>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Configure
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Profile</h3>
            <p className="text-white/80 text-sm mb-4">Complete your owner profile</p>
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Property Form Modal */}
      <PropertyForm
        isOpen={showPropertyForm}
        onClose={() => setShowPropertyForm(false)}
        editingProperty={null}
      />

      {/* Subscription Packages Modal */}
      <SubscriptionPackages
        isOpen={showSubscriptionPackages}
        onClose={() => setShowSubscriptionPackages(false)}
        reason="Unlock premium features for property owners!"
      />
    </div>
  );
};

export default OwnerDashboard;
