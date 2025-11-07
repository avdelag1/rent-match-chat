import { PageTransition } from '@/components/PageTransition';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ClientSwipeContainer } from '@/components/ClientSwipeContainer';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface OwnerDashboardProps {
  onClientInsights?: (profileId: string) => void;
  onMessageClick?: () => void;
}

const OwnerDashboard = ({ onClientInsights, onMessageClick }: OwnerDashboardProps) => {
  const { data: profiles = [], refetch, isLoading, error } = useSmartClientMatching();
  const navigate = useNavigate();

  // Debug logging
  console.log('🏠 OwnerDashboard: profiles count:', profiles.length);
  console.log('🏠 OwnerDashboard: isLoading:', isLoading);
  console.log('🏠 OwnerDashboard: error:', error);

  const handleProfileTap = (profileId: string) => {
    console.log('Profile tapped:', profileId);
    if (onClientInsights) {
      onClientInsights(profileId);
    }
  };

  const handleInsights = (profileId: string) => {
    console.log('Insights requested:', profileId);
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

  return (
    <DashboardLayout userRole="owner">
      <PageTransition>
        <div className="w-full h-full flex items-center justify-center">
          <ClientSwipeContainer
            onClientTap={handleProfileTap}
            onInsights={handleInsights}
            onMessageClick={handleStartConversation}
            profiles={profiles}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
