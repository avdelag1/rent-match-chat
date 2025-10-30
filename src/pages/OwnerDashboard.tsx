import { PageTransition } from '@/components/PageTransition';
import { DashboardLayout } from '@/components/DashboardLayout';
import { InfiniteCardFeed } from '@/components/InfiniteCardFeed';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface OwnerDashboardProps {
  onClientInsights?: (profileId: string) => void;
  onMessageClick?: () => void;
}

const OwnerDashboard = ({ onClientInsights, onMessageClick }: OwnerDashboardProps) => {
  const navigate = useNavigate();

  const handleProfileTap = (profile: any) => {
    console.log('Profile tapped:', profile.user_id);
    if (onClientInsights) {
      onClientInsights(profile.user_id);
    }
  };

  const handleStartConversation = (profile: any) => {
    console.log('💬 Opening chat with client:', profile.user_id);
    navigate(`/messages?startConversation=${profile.user_id}`);
    toast({
      title: 'Opening Chat',
      description: 'Loading conversation...',
    });
  };

  return (
    <DashboardLayout userRole="owner">
      <PageTransition>
        <InfiniteCardFeed
          mode="owner"
          onCardTap={handleProfileTap}
          onMessage={handleStartConversation}
        />
      </PageTransition>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
