import { DashboardLayout } from '@/components/DashboardLayout';
import { CategoryBrowseContainer } from '@/components/CategoryBrowseContainer';
import { ListingFilters } from '@/hooks/useSmartMatching';
import { PageTransition } from '@/components/PageTransition';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
  filters?: ListingFilters;
}

const ClientDashboard = ({ onPropertyInsights, onMessageClick, filters }: ClientDashboardProps) => {
  return (
    <DashboardLayout userRole="client">
      <PageTransition>
        <div className="w-full h-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center p-4">
          <CategoryBrowseContainer
            onListingTap={(listingId) => {
              console.log('Listing tapped:', listingId);
              if (onPropertyInsights) {
                onPropertyInsights(listingId);
              }
            }}
            onInsights={(listingId) => {
              console.log('Insights requested:', listingId);
              if (onPropertyInsights) {
                onPropertyInsights(listingId);
              }
            }}
            onMessageClick={onMessageClick}
            filters={filters}
          />
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default ClientDashboard;
