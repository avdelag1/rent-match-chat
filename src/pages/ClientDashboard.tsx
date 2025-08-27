
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

  return (
    <DashboardLayout userRole="client">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Discover Your Perfect Home</h1>
            <p className="text-white/80 text-lg">Swipe through properties to find your ideal rental</p>
          </div>

          {/* Main Swipe Area */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">
                Available Properties
              </CardTitle>
              <p className="text-white/80 text-center text-sm">
                Swipe right to like, left to pass, or tap for details
              </p>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <SwipeContainer onListingTap={handleListingTap} />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-white mb-2">12</div>
                <p className="text-white/80 text-sm">Properties Viewed</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-white mb-2">5</div>
                <p className="text-white/80 text-sm">Properties Liked</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-white mb-2">2</div>
                <p className="text-white/80 text-sm">Conversations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
