import { useState, useCallback, useMemo, memo } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ClientTinderSwipeContainer } from '@/components/ClientTinderSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useStartConversation } from '@/hooks/useConversations';

interface OwnerDashboardProps {
  onClientInsights?: (profileId: string) => void;
  onMessageClick?: () => void;
}

const OwnerDashboard = memo(({ onClientInsights, onMessageClick }: OwnerDashboardProps) => {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const { data: profiles = [], refetch, isLoading, error } = useSmartClientMatching();
  const navigate = useNavigate();
  const startConversation = useStartConversation();

  const handleProfileTap = useCallback((profileId: string) => {
    setSelectedProfileId(profileId);
    setInsightsOpen(true);
    onClientInsights?.(profileId);
  }, [onClientInsights]);

  const handleStartConversation = useCallback(async (clientId: string) => {
    try {
      toast({
        title: 'Starting conversation...',
        description: 'Please wait...',
      });

      const result = await startConversation.mutateAsync({
        otherUserId: clientId,
        initialMessage: "Hi! I'd like to connect with you.",
        canStartNewConversation: true,
      });

      if (result?.conversationId) {
        navigate(`/messages?conversationId=${result.conversationId}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  }, [startConversation, navigate]);

  const selectedProfile = useMemo(() =>
    profiles.find(p => p.user_id === selectedProfileId) || null,
    [profiles, selectedProfileId]
  );

  return (
    <DashboardLayout userRole="owner">
      <PageTransition>
        <div className="fixed inset-0 w-full h-full overflow-hidden">
          <ClientTinderSwipeContainer
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
});

OwnerDashboard.displayName = 'OwnerDashboard';

export default OwnerDashboard;
