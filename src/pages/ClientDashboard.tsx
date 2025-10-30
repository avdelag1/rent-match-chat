import { DashboardLayout } from '@/components/DashboardLayout';
import { InfiniteCardFeed } from '@/components/InfiniteCardFeed';
import { ListingFilters } from '@/hooks/useSmartMatching';
import { PageTransition } from '@/components/PageTransition';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
  filters?: ListingFilters;
}

const ClientDashboard = ({ onPropertyInsights, onMessageClick, filters }: ClientDashboardProps) => {
  const navigate = useNavigate();
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const handleCardTap = (listing: any) => {
    console.log('Listing tapped:', listing.id);
    if (onPropertyInsights) {
      onPropertyInsights(listing.id);
    }
  };

  const handleMessage = (listing: any) => {
    console.log('💬 Message clicked for listing:', listing.id);
    if (onMessageClick) {
      onMessageClick();
    } else {
      navigate(`/messages?startConversation=${listing.owner_id}`);
    }
  };

  return (
    <DashboardLayout userRole="client">
      <PageTransition>
        <InfiniteCardFeed
          mode="client"
          filters={filters}
          onCardTap={handleCardTap}
          onMessage={handleMessage}
        />
      </PageTransition>
    </DashboardLayout>
  );
};

export default ClientDashboard;
