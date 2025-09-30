import { useState } from 'react';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';

import { MatchCelebration } from '@/components/MatchCelebration';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Users, RefreshCw, MapPin, RotateCcw, Zap, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OwnerDashboardProps {
  onClientInsights?: (profileId: string) => void;
  onMessageClick?: () => void;
}

const OwnerDashboard = ({ onClientInsights, onMessageClick }: OwnerDashboardProps) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationMatching, setShowLocationMatching] = useState(false);
  const [smartMatchingEnabled, setSmartMatchingEnabled] = useState(true);
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });
  
  const { data: profiles = [], isLoading, error, refetch } = useSmartClientMatching();
  const navigate = useNavigate();
  
  // Initialize notifications
  useNotifications();
  
  const handleProfileTap = (profileId: string) => {
    setSelectedProfileId(profileId);
    setInsightsOpen(true);
  };

  const handleInsights = (profileId: string) => {
    setSelectedProfileId(profileId);
    setInsightsOpen(true);
    if (onClientInsights) {
      onClientInsights(profileId);
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
    navigate('/messaging');
  };

  const handleMenuAction = (action: string) => {
    if (action === 'filters') {
      setShowFilters(true);
    }
  };

  const handleSmartMatching = () => {
    setSmartMatchingEnabled(!smartMatchingEnabled);
    setNearbyEnabled(false);
    refetch();
  };

  const handleShowNearby = () => {
    setNearbyEnabled(!nearbyEnabled);
    setSmartMatchingEnabled(false);
    // TODO: Implement location-based filtering
    refetch();
  };

  const selectedProfile = profiles.find(p => p.user_id === selectedProfileId);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">
        <AppSidebar userRole="owner" onMenuItemClick={handleMenuAction} />
        
        <main className="flex-1 relative overflow-hidden">
          {/* Enhanced Header */}
          <header className="absolute top-0 left-0 right-0 z-20 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <SidebarTrigger className="bg-white/20 hover:bg-white/30 text-white border-white/20" />
              <div className="text-center flex-1">
                <h1 className="text-white text-xl font-bold">Browse Clients</h1>
                <p className="text-white/80 text-sm">Explore verified client profiles and connect with potential matches</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>

            {/* Smart Filter Buttons */}
            <div className="flex justify-center gap-3">
              <Button
                variant={smartMatchingEnabled ? "default" : "outline"}
                onClick={handleSmartMatching}
                className={`gap-2 rounded-full px-6 py-2 transition-all duration-300 ${
                  smartMatchingEnabled 
                    ? 'bg-white text-orange-500 hover:bg-white/90 shadow-lg' 
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
              >
                <Zap className="w-4 h-4" />
                Smart Matching
              </Button>
              <Button
                variant={nearbyEnabled ? "default" : "outline"}
                onClick={handleShowNearby}
                className={`gap-2 rounded-full px-6 py-2 transition-all duration-300 ${
                  nearbyEnabled 
                    ? 'bg-white text-orange-500 hover:bg-white/90 shadow-lg' 
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Show Nearby
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <div className="absolute inset-0 pt-32 pb-6 px-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin text-white">
                  <Users className="w-8 h-8" />
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-white">
                <div className="text-6xl mb-4">😞</div>
                <h3 className="text-xl font-bold mb-2">Error loading</h3>
                <p className="text-white/80 mb-4">Please try again.</p>
                <Button 
                  onClick={() => refetch()}
                  variant="outline"
                  className="gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            ) : profiles.length === 0 ? (
              <div className="max-w-md mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Tenants Found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters to see more profiles.</p>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setShowFilters(true)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Filter className="w-5 h-5 mr-2" />
                      Adjust Filters
                    </Button>
                    <Button 
                      onClick={() => refetch()}
                      variant="outline"
                      className="w-full rounded-2xl py-3 border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <ClientSwipeContainer 
                onClientTap={handleProfileTap}
                onInsights={handleInsights}
                onMessageClick={onMessageClick}
                showFilters={showFilters}
                onFiltersClose={() => setShowFilters(false)}
                onFiltersOpen={() => setShowFilters(true)}
              />
            )}
          </div>
        </main>
      </div>

      <ClientInsightsDialog
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
        profile={selectedProfile || null}
      />

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

    </SidebarProvider>
  );
};

export default OwnerDashboard;