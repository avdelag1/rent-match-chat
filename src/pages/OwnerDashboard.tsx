
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useClientProfiles } from '@/hooks/useClientProfiles';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw } from 'lucide-react';

interface OwnerDashboardProps {
  onClientInsights?: (profileId: string) => void;
  onMessageClick?: () => void;
}

const OwnerDashboard = ({ onClientInsights, onMessageClick }: OwnerDashboardProps) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const { data: profiles = [], isLoading, error, refetch } = useClientProfiles();
  
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

  const selectedProfile = profiles.find(p => p.user_id === selectedProfileId);

  // Emergency fallback content for debugging
  const renderEmergencyFallback = () => (
    <DashboardLayout userRole="owner">
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Reduced Header */}
          <div className="text-center mb-6">
            <div className="border-b border-white/10 pb-4">
              <h1 className="text-3xl font-bold text-white mb-2">Discover Potential Tenants</h1>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-2"></div>
              <p className="text-white/70">Swipe through client profiles to find your ideal tenants</p>
            </div>
          </div>

          {/* Tenants Section with reduced spacing */}
          <div className="border border-white/10 rounded-lg p-4 min-h-[600px]">
            <h2 className="text-xl font-semibold text-white text-center mb-2">Potential Tenants</h2>
            <p className="text-white/60 text-center mb-8">{profiles.length} available</p>
            
            {isLoading ? (
              <div className="flex justify-center">
                <div className="space-y-4 w-full max-w-sm">
                  <Skeleton className="w-full h-64 rounded-lg bg-white/10" />
                  <Skeleton className="w-3/4 h-6 bg-white/10" />
                  <Skeleton className="w-1/2 h-4 bg-white/10" />
                  <div className="flex space-x-2">
                    <Skeleton className="w-16 h-6 rounded-full bg-white/10" />
                    <Skeleton className="w-20 h-6 rounded-full bg-white/10" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Users className="w-16 h-16 text-white/60" />
                <h3 className="text-xl font-semibold text-white">Unable to load tenants</h3>
                <p className="text-white/70 text-center">There was an error loading client profiles. Please try again.</p>
                <Button 
                  onClick={() => refetch()}
                  className="gap-2"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            ) : profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Users className="w-16 h-16 text-white/60" />
                <h3 className="text-xl font-semibold text-white">No tenants available</h3>
                <p className="text-white/70 text-center">Check back later for new client profiles!</p>
                <Button 
                  onClick={() => refetch()}
                  className="gap-2"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
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
    </DashboardLayout>
  );

  return renderEmergencyFallback();
};

export default OwnerDashboard;
