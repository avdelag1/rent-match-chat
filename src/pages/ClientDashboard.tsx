
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SwipeContainer } from '@/components/SwipeContainer';
import { DashboardLayout } from '@/components/DashboardLayout';

const ClientDashboard = () => {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  const handleListingTap = (listingId: string) => {
    setSelectedListingId(listingId);
    // Property details will be handled by the layout
  };

  const handleInsights = (listingId: string) => {
    console.log('View insights for listing:', listingId);
    // TODO: Implement insights modal/page
  };

  const handleMessageClick = () => {
    console.log('Message requires premium subscription');
    // This will be handled by the layout to show subscription packages
  };

  return (
    <DashboardLayout userRole="client">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Discover Your Perfect Home</h1>
          </div>

          {/* Main Swipe Area */}
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
                onMessageClick={handleMessageClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
