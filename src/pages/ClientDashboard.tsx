import { useState, useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TinderentSwipeContainer } from '@/components/TinderentSwipeContainer';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { useListings } from '@/hooks/useListings';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

export default function ClientDashboard({ onPropertyInsights, onMessageClick }: ClientDashboardProps) {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const { data: listings = [] } = useListings([]);

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
    </DashboardLayout>
  );
}
