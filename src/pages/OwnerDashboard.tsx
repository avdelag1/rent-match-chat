import { useState, useCallback, useMemo, memo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ClientTinderSwipeContainer } from '@/components/ClientTinderSwipeContainer';
import { ClientInsightsDialog } from '@/components/ClientInsightsDialog';
import { ProfilePhotoNotification } from '@/components/ProfilePhotoNotification';
import { useSmartClientMatching } from '@/hooks/useSmartMatching';
import { useOwnerProfile } from '@/hooks/useOwnerProfile';
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
  const { data: ownerProfile } = useOwnerProfile();
  const navigate = useNavigate();
  const startConversation = useStartConversation();

  // Check if owner has uploaded at least one photo
  const hasPhotos = ownerProfile?.profile_images && ownerProfile.profile_images.length > 0;

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
      {/* Profile Photo Upload Notification */}
      <ProfilePhotoNotification hasPhotos={!!hasPhotos} userRole="owner" />

      <ClientTinderSwipeContainer
        onClientTap={handleProfileTap}
        onInsights={handleProfileTap}
        onMessageClick={handleStartConversation}
        profiles={profiles}
        isLoading={isLoading}
        error={error}
      />

      <ClientInsightsDialog
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
        profile={selectedProfile}
      />
    </DashboardLayout>
  );
});

OwnerDashboard.displayName = 'OwnerDashboard';

export default OwnerDashboard;
