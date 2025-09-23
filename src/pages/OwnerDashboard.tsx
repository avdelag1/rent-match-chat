import { useState } from 'react';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { MatchCelebration } from '@/components/MatchCelebration';
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useClientProfiles } from '@/hooks/useClientProfiles';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

interface OwnerDashboardProps {
  onClientInsights?: (profileId: string) => void;
  onMessageClick?: () => void;
}

const OwnerDashboard = ({ onClientInsights, onMessageClick }: OwnerDashboardProps) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
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

  const selectedProfile = profiles.find(p => p.user_id === selectedProfileId);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-400 to-red-500">
        <AppSidebar userRole="owner" />
        
        <div className="flex-1 flex flex-col relative">
          {/* Header with minimal controls */}
          <div className="p-4 text-center">
            <h1 className="text-2xl font-bold text-white">Discover Clients</h1>
            <p className="text-white/80">Find your perfect tenants</p>
          </div>

          {/* Main Swipe Container */}
          <div className="flex-1 flex items-center justify-center px-4 pb-4">
            {isLoading ? (
              <div className="text-center text-white">
                <div className="text-6xl mb-4">⏳</div>
                <p>Loading profiles...</p>
              </div>
            ) : error ? (
              <div className="text-center text-white">
                <div className="text-6xl mb-4">😞</div>
                <h3 className="text-xl font-bold mb-2">Error loading profiles</h3>
                <p className="mb-4">Please try again</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center text-white">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-bold mb-2">No Clients Found</h3>
                <p>Try adjusting your preferences</p>
              </div>
            ) : (
              <div className="w-full h-[700px]">
                <ClientSwipeContainer 
                  onClientTap={handleProfileTap}
                  onInsights={handleInsights}
                  onMessageClick={onMessageClick}
                />
              </div>
            )}
          </div>
        </div>
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