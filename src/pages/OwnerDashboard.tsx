
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
      <div className="min-h-screen p-2 md:p-4">
        <div className="max-w-lg mx-auto">
          {/* Compact Header */}
          <div className="text-center mb-3">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Find Your Tenants</h1>
            <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto mb-1"></div>
            <p className="text-white/70 text-sm">Swipe to connect with clients</p>
          </div>

          {/* Compact Tenants Section */}
          <div className="rounded-lg p-2 min-h-[70vh]">
            <h2 className="text-lg font-semibold text-white text-center mb-1">Available Tenants</h2>
            <p className="text-white/60 text-center mb-4 text-sm">{profiles.length} profiles</p>
            
            {isLoading ? (
              <div className="flex justify-center">
                <div className="space-y-3 w-full max-w-xs">
                  <Skeleton className="w-full h-48 rounded-lg bg-white/10" />
                  <Skeleton className="w-3/4 h-4 bg-white/10" />
                  <Skeleton className="w-1/2 h-3 bg-white/10" />
                  <div className="flex space-x-2">
                    <Skeleton className="w-12 h-4 rounded-full bg-white/10" />
                    <Skeleton className="w-16 h-4 rounded-full bg-white/10" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-8">
                <Users className="w-12 h-12 text-white/60" />
                <h3 className="text-lg font-semibold text-white">Unable to load tenants</h3>
                <p className="text-white/70 text-center text-sm">Error loading profiles. Please try again.</p>
                <Button 
                  onClick={() => refetch()}
                  className="gap-2"
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            ) : profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-8">
                <Users className="w-12 h-12 text-white/60" />
                <h3 className="text-lg font-semibold text-white">No tenants available</h3>
                <p className="text-white/70 text-center text-sm">Check back later for new profiles!</p>
                <Button 
                  onClick={() => refetch()}
                  className="gap-2"
                  variant="outline"
                  size="sm"
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
