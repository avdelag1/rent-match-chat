import { useState, useCallback, useMemo, memo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TinderentSwipeContainer } from '@/components/TinderentSwipeContainer';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { PageTransition } from '@/components/PageTransition';
import { ProfilePhotoNotification } from '@/components/ProfilePhotoNotification';
import { useListings } from '@/hooks/useListings';
import { useClientProfile } from '@/hooks/useClientProfile';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

const ClientDashboard = memo(({ onPropertyInsights, onMessageClick }: ClientDashboardProps) => {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const { data: listings = [] } = useListings([]);
  const { data: profile } = useClientProfile();

  // Check if user has uploaded at least one photo
  const hasPhotos = profile?.profile_images && profile.profile_images.length > 0;

  const handleListingTap = useCallback((listingId: string) => {
    setSelectedListingId(listingId);
    setInsightsOpen(true);
    onPropertyInsights?.(listingId);
  }, [onPropertyInsights]);

  const selectedListing = useMemo(() => 
    listings.find(l => l.id === selectedListingId) || null,
    [listings, selectedListingId]
  );

  return (
    <DashboardLayout userRole="client">
      <PageTransition>
        {/* Profile Photo Upload Notification */}
        <ProfilePhotoNotification hasPhotos={!!hasPhotos} userRole="client" />

        <TinderentSwipeContainer
          onListingTap={handleListingTap}
          onInsights={handleListingTap}
          onMessageClick={onMessageClick}
        />

        <PropertyInsightsDialog
          open={insightsOpen}
          onOpenChange={setInsightsOpen}
          listing={selectedListing}
        />
      </PageTransition>
    </DashboardLayout>
  );
});

ClientDashboard.displayName = 'ClientDashboard';

export default ClientDashboard;
