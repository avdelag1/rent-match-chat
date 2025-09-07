
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useClientProfiles } from '@/hooks/useClientProfiles';

interface OwnerDashboardProps {
  onClientInsights?: (profileId: string) => void;
  onMessageClick?: () => void;
}

const OwnerDashboard = ({ onClientInsights, onMessageClick }: OwnerDashboardProps) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const { data: profiles = [] } = useClientProfiles();

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

  return (
    <DashboardLayout userRole="owner">
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="border-b border-white/10 pb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Discover Potential Tenants</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-4"></div>
              <p className="text-white/70">Swipe through client profiles to find your ideal tenants</p>
            </div>
          </div>

          {/* Tenants Section */}
          <div className="border border-white/10 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-white text-center mb-2">Potential Tenants</h2>
            <p className="text-white/60 text-center mb-8">{profiles.length} available</p>
            <div className="flex justify-center">
              <ClientSwipeContainer 
                onClientTap={handleProfileTap}
                onInsights={handleInsights}
                onMessageClick={onMessageClick}
              />
            </div>
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
};

export default OwnerDashboard;
