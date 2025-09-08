
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TinderentSwipeContainer } from '@/components/TinderentSwipeContainer';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useListings } from '@/hooks/useListings';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

const ClientDashboard = ({ onPropertyInsights, onMessageClick }: ClientDashboardProps) => {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const { data: listings = [] } = useListings();

  const handleListingTap = (listingId: string) => {
    console.log('Listing tapped:', listingId);
    setSelectedListingId(listingId);
    setInsightsOpen(true);
  };

  const handleInsights = (listingId: string) => {
    setSelectedListingId(listingId);
    setInsightsOpen(true);
    if (onPropertyInsights) {
      onPropertyInsights(listingId);
    }
  };

  const selectedListing = listings.find(l => l.id === selectedListingId);

  return (
    <DashboardLayout userRole="client">
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 tracking-wide">Discover Your Perfect Home</h1>
              <div className="flex items-center justify-center mb-4">
                <span className="text-3xl mr-2">🏠</span>
                <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                <span className="text-3xl ml-2">✨</span>
              </div>
              <p className="text-slate-300 text-lg">Swipe through amazing properties just for you</p>
            </div>
          </div>

          {/* Properties Section */}
          <div className="bg-gradient-to-br from-slate-800/50 to-blue-900/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Available Properties</h2>
              <p className="text-slate-400">Find your next home with a simple swipe</p>
            </div>
            <div className="flex justify-center">
              <TinderentSwipeContainer 
                onListingTap={handleListingTap} 
                onInsights={handleInsights}
                onMessageClick={onMessageClick}
              />
            </div>
          </div>
        </div>
      </div>

      <PropertyInsightsDialog
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
        listing={selectedListing || null}
      />
    </DashboardLayout>
  );
};

export default ClientDashboard;
