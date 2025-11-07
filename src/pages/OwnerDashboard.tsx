import { useState } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface OwnerDashboardProps {
  onClientInsights?: (profileId: string) => void;
  onMessageClick?: () => void;
}

const OwnerDashboard = ({ onClientInsights, onMessageClick }: OwnerDashboardProps) => {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const { data: profiles = [], refetch, isLoading, error } = useSmartClientMatching();
  const navigate = useNavigate();

  // Debug logging
  console.log('🏠 OwnerDashboard: profiles count:', profiles.length);
  console.log('🏠 OwnerDashboard: isLoading:', isLoading);
  console.log('🏠 OwnerDashboard: error:', error);

  const handleProfileTap = (profileId: string) => {
    console.log('Profile tapped:', profileId);
    setSelectedProfileId(profileId);
    setInsightsOpen(true);
    if (onClientInsights) {
      onClientInsights(profileId);
    }
  };

  const handleStartConversation = (clientId: string) => {
    console.log('💬 Opening chat with client:', clientId);
    navigate(`/messages?startConversation=${clientId}`);
    toast({
      title: 'Opening Chat',
      description: 'Loading conversation...',
    });
  };

  const selectedProfile = profiles.find(p => p.user_id === selectedProfileId) || null;

  return (
    <DashboardLayout userRole="owner">
      <PageTransition>
        <div className="w-full h-full flex items-center justify-center">
          <ClientSwipeContainer
            onClientTap={handleProfileTap}
            onInsights={handleProfileTap}
            onMessageClick={handleStartConversation}
            profiles={profiles}
            isLoading={isLoading}
            error={error}
          />
        </div>

        <ClientInsightsDialog
          open={insightsOpen}
          onOpenChange={setInsightsOpen}
          profile={selectedProfile}
        />
      </PageTransition>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
