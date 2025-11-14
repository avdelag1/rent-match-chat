import { useState, useCallback, useMemo, memo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TinderentSwipeContainer } from '@/components/TinderentSwipeContainer';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { PageTransition } from '@/components/PageTransition';
import { useListings } from '@/hooks/useListings';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

const ClientDashboard = memo(({ onPropertyInsights, onMessageClick }: ClientDashboardProps) => {
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
      <PageTransition>
        <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <TinderentSwipeContainer
              onListingTap={handleListingTap}
              onInsights={handleListingTap}
              onMessageClick={onMessageClick}
            />
          </div>
        </div>

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
