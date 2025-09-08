
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 tracking-wide">Discover Potential Tenants</h1>
              <div className="flex items-center justify-center mb-4">
                <span className="text-3xl mr-2">👥</span>
                <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
                <span className="text-3xl ml-2">🎯</span>
              </div>
              <p className="text-slate-300 text-lg">Find the perfect tenants for your properties</p>
            </div>
          </div>

          {/* Tenants Section */}
          <div className="bg-gradient-to-br from-slate-800/50 to-blue-900/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Potential Tenants</h2>
              <p className="text-slate-400">{profiles.length} available profiles • Swipe to connect</p>
            </div>
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
