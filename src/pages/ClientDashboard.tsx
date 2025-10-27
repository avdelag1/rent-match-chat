import { DashboardLayout } from '@/components/DashboardLayout';
import { CategoryBrowseContainer } from '@/components/CategoryBrowseContainer';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

const ClientDashboard = ({ onPropertyInsights, onMessageClick }: ClientDashboardProps) => {
  return (
    <DashboardLayout userRole="client">
      <div className="w-full min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center p-4 py-8">
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
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
