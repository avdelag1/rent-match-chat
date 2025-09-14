
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TinderentSwipeContainer } from '@/components/TinderentSwipeContainer';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { ClientStatsCard } from '@/components/ClientStatsCard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useListings } from '@/hooks/useListings';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

const ClientDashboard = ({ onPropertyInsights, onMessageClick }: ClientDashboardProps) => {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const { data: listings = [], isLoading, error, refetch } = useListings();
  
  console.log('ClientDashboard - Listings:', listings.length, 'Loading:', isLoading, 'Error:', error);

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

  // Emergency fallback content for debugging
  const renderEmergencyFallback = () => (
    <DashboardLayout userRole="client">
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Discover Properties</h1>
            <p className="text-white/70">Find your perfect home</p>
          </div>

          {/* Stats Card - Above Properties */}
          <ClientStatsCard />

          {/* Properties Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">Available Properties</h2>
            
            {isLoading ? (
              <div className="flex justify-center">
                <div className="space-y-4 w-full max-w-sm">
                  <Skeleton className="w-full h-64 rounded-lg" />
                  <Skeleton className="w-3/4 h-6" />
                  <Skeleton className="w-1/2 h-4" />
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Home className="w-16 h-16 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700">Unable to load properties</h3>
                <p className="text-gray-500 text-center">There was an error loading properties. Please try again.</p>
                <Button 
                  onClick={() => refetch()}
                  className="gap-2"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Home className="w-16 h-16 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700">No properties available</h3>
                <p className="text-gray-500 text-center">Check back later for new listings!</p>
                <Button 
                  onClick={() => refetch()}
                  className="gap-2"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
                <TinderentSwipeContainer
                  onListingTap={handleListingTap} 
                  onInsights={handleInsights}
                  onMessageClick={onMessageClick}
                />
              </div>
            )}
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

  return renderEmergencyFallback();
};

export default ClientDashboard;
