
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SwipeContainer } from '@/components/SwipeContainer';
import { DashboardLayout } from '@/components/DashboardLayout';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

const ClientDashboard = ({ onPropertyInsights, onMessageClick }: ClientDashboardProps) => {
  const handleListingTap = (listingId: string) => {
    console.log('Listing tapped:', listingId);
  };

  const handleInsights = (listingId: string) => {
    if (onPropertyInsights) {
      onPropertyInsights(listingId);
    }
  };

  return (
    <DashboardLayout userRole="client">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Discover Your Perfect Home</h1>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">
                Available Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <SwipeContainer 
                onListingTap={handleListingTap} 
                onInsights={handleInsights}
                onMessageClick={onMessageClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
