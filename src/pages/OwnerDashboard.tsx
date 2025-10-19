import { useState, useEffect } from 'react';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { SupportDialog } from '@/components/SupportDialog';
import { NotificationsDialog } from '@/components/NotificationsDialog';
import { OwnerClientFilters } from '@/components/OwnerClientFilters';
import { CategorySelectionDialog } from '@/components/CategorySelectionDialog';
import { MatchCelebration } from '@/components/MatchCelebration';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Users, MapPin, RotateCcw, Zap, Home, Ship, Bike, BikeIcon, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useListings } from '@/hooks/useListings';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface OwnerDashboardProps {
  onClientInsights?: (profileId: string) => void;
  onMessageClick?: () => void;
}

const OwnerDashboard = ({ onClientInsights, onMessageClick }: OwnerDashboardProps) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [smartMatchingEnabled, setSmartMatchingEnabled] = useState(true);
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });
  
  const { user } = useAuth();
  const { data: profiles = [], isLoading, error, refetch } = useSmartClientMatching();
  const { data: allListings = [] } = useListings();
  const navigate = useNavigate();
  
  // Calculate listing stats by category
  const listingStats = {
    properties: allListings.filter(l => l.category === 'property' && l.owner_id === user?.id).length,
    yachts: allListings.filter(l => l.category === 'yacht' && l.owner_id === user?.id).length,
    motorcycles: allListings.filter(l => l.category === 'motorcycle' && l.owner_id === user?.id).length,
    bicycles: allListings.filter(l => l.category === 'bicycle' && l.owner_id === user?.id).length,
    total: allListings.filter(l => l.owner_id === user?.id).length,
  };
  
  // Initialize notifications
  useNotifications();
  
  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refetch]);
  
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

  const handleCategorySelect = (category: 'property' | 'yacht' | 'motorcycle' | 'bicycle', mode: 'rent' | 'sale' | 'both') => {
    navigate(`/owner/properties#add-${category}`);
  };

  const handleStatCardClick = (category: string) => {
    if (category === 'total') {
      navigate('/owner/properties');
    } else {
      navigate(`/owner/properties?category=${category}`);
    }
  };

  const handleMenuAction = (action: string) => {
    console.log('[OwnerDashboard] Menu action:', action);
    if (action === 'add-listing') {
      setShowCategoryDialog(true);
    } else if (action === 'premium-packages') {
      navigate('/subscription-packages');
    } else if (action === 'support') {
      setShowSupport(true);
    } else if (action === 'notifications') {
      setShowNotifications(true);
    } else if (action === 'filters') {
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
          {/* Enhanced Header with Stats */}
          <header className="absolute top-0 left-0 right-0 z-20 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <SidebarTrigger className="bg-white/20 hover:bg-white/30 text-white border-white/20" />
              <div className="text-center flex-1">
                <h1 className="text-white text-xl font-bold">Owner Dashboard</h1>
                <p className="text-white/80 text-sm">Manage your listings and find potential tenants</p>
              </div>
              <Button
                onClick={() => setShowCategoryDialog(true)}
                className="bg-white text-orange-500 hover:bg-white/90 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Listing
              </Button>
            </div>

            {/* Listing Stats Cards */}
            <div className="grid grid-cols-5 gap-2">
              <Card 
                className="bg-white/90 backdrop-blur border-white/20 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStatCardClick('property')}
              >
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <Home className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Properties</p>
                    <p className="text-lg font-bold">{listingStats.properties}</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-white/90 backdrop-blur border-white/20 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStatCardClick('yacht')}
              >
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <Ship className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Yachts</p>
                    <p className="text-lg font-bold">{listingStats.yachts}</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-white/90 backdrop-blur border-white/20 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStatCardClick('motorcycle')}
              >
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <BikeIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Motorcycles</p>
                    <p className="text-lg font-bold">{listingStats.motorcycles}</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-white/90 backdrop-blur border-white/20 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStatCardClick('bicycle')}
              >
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <Bike className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bicycles</p>
                    <p className="text-lg font-bold">{listingStats.bicycles}</p>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="bg-white/90 backdrop-blur border-white/20 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStatCardClick('total')}
              >
                <CardContent className="p-3 flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">{listingStats.total}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Client Matching Section Title */}
            <div className="flex justify-between items-center">
              <h2 className="text-white text-lg font-semibold">Find Your Perfect Tenant</h2>
              {/* Smart Filter Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={smartMatchingEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={handleSmartMatching}
                  className={`gap-2 rounded-full px-4 py-1 transition-all duration-300 ${
                    smartMatchingEnabled 
                      ? 'bg-white text-orange-500 hover:bg-white/90 shadow-lg' 
                      : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  Smart Match
                </Button>
                <Button
                  variant={nearbyEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={handleShowNearby}
                  className={`gap-2 rounded-full px-4 py-1 transition-all duration-300 ${
                    nearbyEnabled 
                      ? 'bg-white text-orange-500 hover:bg-white/90 shadow-lg' 
                      : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  Nearby
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="absolute inset-0 pt-80 pb-6 px-4">
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Clients Found</h3>
                  <p className="text-gray-600 mb-6">Check back later for new profiles.</p>
                  
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
            ) : (
              <ClientSwipeContainer 
                onClientTap={handleProfileTap}
                onInsights={handleInsights}
                onMessageClick={onMessageClick}
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

      <SupportDialog
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        userRole="owner"
      />

      <NotificationsDialog
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <OwnerClientFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        currentFilters={appliedFilters}
        onApplyFilters={(filters) => {
          setAppliedFilters(filters);
          console.log('Applied owner filters:', filters);
          setShowFilters(false);
        }}
      />

      <CategorySelectionDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onCategorySelect={handleCategorySelect}
      />

    </SidebarProvider>
  );
};

export default OwnerDashboard;