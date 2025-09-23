import { useState } from 'react';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { LocationBasedMatching } from '@/components/LocationBasedMatching';
import { MatchCelebration } from '@/components/MatchCelebration';
import { useClientProfiles } from '@/hooks/useClientProfiles';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Users, RefreshCw, MapPin, RotateCcw } from 'lucide-react';
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
  const [matchCelebration, setMatchCelebration] = useState<{
    isOpen: boolean;
    clientProfile?: any;
    ownerProfile?: any;
  }>({ isOpen: false });
  
  const { data: profiles = [], isLoading, error, refetch } = useClientProfiles();
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

  const selectedProfile = profiles.find(p => p.user_id === selectedProfileId);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">
        <AppSidebar userRole="owner" onMenuItemClick={handleMenuAction} />
        
        <main className="flex-1 relative overflow-hidden">
          {/* Minimal Header */}
          <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
            <SidebarTrigger className="bg-white/20 hover:bg-white/30 text-white border-white/20" />
            <div className="text-white text-lg font-semibold">
              Browse Clients
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </header>

          {/* Full Screen Swipe Container */}
          <div className="absolute inset-0 pt-16 pb-6 px-4">
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
              <div className="flex flex-col items-center justify-center h-full text-center text-white">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-bold mb-2">No Clients Found</h3>
                <p className="text-white/80 mb-4">Try adjusting filters or check back later.</p>
                <Button 
                  onClick={() => refetch()}
                  variant="outline"
                  className="gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            ) : (
              <ClientSwipeContainer 
                onClientTap={handleProfileTap}
                onInsights={handleInsights}
                onMessageClick={onMessageClick}
                showFilters={showFilters}
                onFiltersClose={() => setShowFilters(false)}
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