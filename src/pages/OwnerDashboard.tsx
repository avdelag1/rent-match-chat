
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useClientProfiles } from '@/hooks/useClientProfiles';
import QuickActions from '@/components/QuickActions';
import NotificationManager from '@/components/NotificationManager';

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
      <NotificationManager />
      <div className="min-h-screen bg-transparent p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <QuickActions role="owner" />
          
          {/* Welcome Section */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="glass-morphism rounded-2xl p-6 lg:p-8 mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">🏢 Find Perfect Tenants</h1>
              <div className="w-24 h-1 bg-gradient-button mx-auto mb-4"></div>
              <p className="text-white/80 text-lg">Discover qualified tenants who match your property requirements</p>
              
              {/* Property Owner Stats */}
              <div className="flex justify-center space-x-8 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{profiles.length}</div>
                  <div className="text-white/60 text-sm">Candidates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">AI</div>
                  <div className="text-white/60 text-sm">Screening</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">Smart</div>
                  <div className="text-white/60 text-sm">Matching</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Search Section */}
          <div className="glass-morphism rounded-2xl p-6 lg:p-8 shadow-glow">
            <div className="flex items-center justify-center mb-6">
              <h2 className="text-xl lg:text-2xl font-semibold text-white">Review Tenant Profiles</h2>
              <span className="ml-2 text-2xl animate-float">👥</span>
            </div>
            <p className="text-white/70 text-center mb-8">
              {profiles.length} verified tenants ready to view • Swipe to find your match
            </p>
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
