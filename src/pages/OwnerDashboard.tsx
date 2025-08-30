
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
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Discover Potential Tenants</h1>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">
                Potential Tenants
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <ClientSwipeContainer 
                onClientTap={handleProfileTap}
                onInsights={handleInsights}
                onMessageClick={onMessageClick}
              />
            </CardContent>
          </Card>
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
