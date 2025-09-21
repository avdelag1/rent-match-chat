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

  return (
    <DashboardLayout userRole="owner">
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-48 mx-auto px-1 pt-1 pb-2">
            {/* Header Section */}
            <div className="text-center mb-1">
              <h1 className="text-xs font-bold text-white">Browse Clients</h1>
              <p className="text-white/80 text-xs leading-tight">Explore client profiles</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-0.5 justify-center mb-1">
              <Button
                onClick={() => setShowLocationMatching(!showLocationMatching)}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-400/30 text-orange-300 hover:bg-orange-500/20 text-xs px-1 py-0.5 h-5"
              >
                ⚡
              </Button>
              <Button
                onClick={() => setShowLocationMatching(!showLocationMatching)}
                variant="outline"
                size="sm"
                className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/30 text-blue-300 hover:bg-blue-500/20 text-xs px-1 py-0.5 h-5"
              >
                📍
              </Button>
            </div>

            {/* Main Content Area */}
            <div className="w-full">
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="space-y-1 w-full max-w-48">
                    <div className="animate-pulse">
                      <div className="w-full h-24 bg-white/10 rounded mb-1"></div>
                      <div className="h-2 bg-white/10 rounded w-3/4 mb-0.5"></div>
                      <div className="h-1 bg-white/10 rounded w-1/2 mb-1"></div>
                      <div className="flex space-x-0.5">
                        <div className="h-2 bg-white/10 rounded-full w-6"></div>
                        <div className="h-2 bg-white/10 rounded-full w-8"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center space-y-1 py-2 text-center">
                  <div className="text-lg mb-0.5">😞</div>
                  <h3 className="text-xs font-bold text-white">Error loading</h3>
                  <p className="text-white/70 text-xs max-w-48 leading-tight">Please try again.</p>
                  <Button 
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                    className="gap-0.5 bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs py-0.5 h-5"
                  >
                    🔄 Try Again
                  </Button>
                </div>
              ) : profiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-1 py-3 text-center">
                  <div className="text-lg mb-0.5">👥</div>
                  <h3 className="text-xs font-bold text-white">No Clients Found</h3>
                  <p className="text-white/70 text-xs max-w-48 leading-tight">Try adjusting filters.</p>
                  <div className="flex flex-col gap-0.5 w-full max-w-48">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="gap-0.5 w-full bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-white hover:bg-primary/20 text-xs py-0.5 h-5"
                    >
                      ⚙️ Filters
                    </Button>
                    <Button 
                      onClick={() => refetch()}
                      variant="outline"
                      size="sm"
                      className="gap-0.5 w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs py-0.5 h-5"
                    >
                      🔄 Refresh
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-48 mx-auto">
                  {showLocationMatching ? (
                    <div className="text-center py-4">
                      <div className="text-lg">📍</div>
                      <p className="text-xs text-white/70">Location matching coming soon</p>
                    </div>
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
};

export default OwnerDashboard;