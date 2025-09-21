
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LocationBasedMatching } from '@/components/LocationBasedMatching';
import { MatchCelebration } from '@/components/MatchCelebration';
import { useClientProfiles } from '@/hooks/useClientProfiles';
import { useNotifications } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw, MapPin } from 'lucide-react';
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
  
  console.log('OwnerDashboard - Profiles:', profiles.length, 'Loading:', isLoading, 'Error:', error);

  const handleProfileTap = (profileId: string) => {
    console.log('Profile tapped:', profileId);
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

  const renderEmergencyFallback = () => (
    <DashboardLayout userRole="owner">
      <div className="min-h-screen w-full overflow-x-hidden">
        <div className="w-full max-w-sm mx-auto px-3 py-4 space-y-4">
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-lg font-bold text-white mb-1">Browse Clients</h1>
            <p className="text-white/80 text-xs">
              Explore verified client profiles and connect with potential matches
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => setShowLocationMatching(!showLocationMatching)}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-400/30 text-orange-300 hover:bg-orange-500/20 gap-1 text-xs px-3"
            >
              <span className="text-orange-400">⚡</span>
              Smart Matching
            </Button>
            <Button
              onClick={() => setShowLocationMatching(!showLocationMatching)}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/30 text-blue-300 hover:bg-blue-500/20 gap-1 text-xs px-3"
            >
              <MapPin className="w-3 h-3" />
              Show Nearby
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="w-full">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="space-y-3 w-full max-w-xs">
                  <div className="animate-pulse">
                    <div className="w-full h-48 bg-white/10 rounded-lg mb-3"></div>
                    <div className="h-3 bg-white/10 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-white/10 rounded w-1/2 mb-2"></div>
                    <div className="flex space-x-2">
                      <div className="h-5 bg-white/10 rounded-full w-12"></div>
                      <div className="h-5 bg-white/10 rounded-full w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-6 text-center">
                <div className="text-4xl mb-2">😞</div>
                <h3 className="text-lg font-bold text-white">Unable to load tenants</h3>
                <p className="text-white/70 text-xs max-w-xs">
                  Error loading profiles. Please check your connection and try again.
                </p>
                <Button 
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try Again
                </Button>
              </div>
            ) : profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                <div className="text-4xl mb-2">👥</div>
                <h3 className="text-lg font-bold text-white">No Tenants Found</h3>
                <p className="text-white/70 text-xs max-w-xs">
                  Try adjusting your filters to see more profiles.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="gap-1 w-full bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-white hover:bg-primary/20 text-xs"
                  >
                    <span className="text-primary">⚙️</span>
                    Adjust Filters
                  </Button>
                  <Button 
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                    className="gap-1 w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {showLocationMatching ? (
                  <LocationBasedMatching />
                ) : (
                  <ClientSwipeContainer 
                    onClientTap={handleProfileTap}
                    onInsights={handleInsights}
                    onMessageClick={onMessageClick}
                  />
                )}
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
    </DashboardLayout>
  );

  return renderEmergencyFallback();
};

export default OwnerDashboard;
