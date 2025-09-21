import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TinderentSwipeContainer } from '@/components/TinderentSwipeContainer';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { LocationBasedMatching } from '@/components/LocationBasedMatching';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, Heart } from 'lucide-react';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

const ClientDashboard = ({ onPropertyInsights, onMessageClick }: ClientDashboardProps) => {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    city?: string;
    radius: number;
  } | null>(null);
  const { data: listings = [], isLoading, error, refetch } = useListings();
  const { user } = useAuth();
  
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

  return (
    <DashboardLayout userRole="client">
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-md mx-auto px-4 pt-4 pb-6">
            {/* Header Section */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Find Properties</h2>
              <p className="text-white/80 text-base mt-2">
                {user?.user_metadata?.full_name || 'Welcome back!'}
              </p>
            </div>

            {/* Stats Quick View */}
            <div className="flex gap-4 justify-center mb-6">
              <div className="bg-white/10 rounded-lg px-4 py-3 text-center min-w-[80px]">
                <p className="text-lg font-semibold text-white">{listings.length}</p>
                <p className="text-sm text-white/70">Properties</p>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-3 text-center min-w-[80px]">
                <p className="text-lg font-semibold text-white">0</p>
                <p className="text-sm text-white/70">Matches</p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full">
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="space-y-4 w-full max-w-sm">
                    <div className="animate-pulse">
                      <div className="w-full h-80 bg-white/10 rounded-lg mb-4"></div>
                      <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-white/10 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                  <div className="text-4xl mb-2">😞</div>
                  <h3 className="text-lg font-bold text-white">Error loading</h3>
                  <p className="text-white/70 text-base max-w-sm leading-relaxed">Please try again.</p>
                  <Button 
                    onClick={() => refetch()}
                    variant="outline"
                    size="default"
                    className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    🔄 Try Again
                  </Button>
                </div>
              ) : listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                  <div className="text-4xl mb-2">🏠</div>
                  <h3 className="text-lg font-bold text-white">No Properties Found</h3>
                  <p className="text-white/70 text-base max-w-sm leading-relaxed">Try adjusting filters or check back later.</p>
                  <Button 
                    onClick={() => refetch()}
                    variant="outline"
                    size="default"
                    className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    🔄 Refresh
                  </Button>
                </div>
              ) : (
                <div className="w-full">
                  <TinderentSwipeContainer
                    onListingTap={handleListingTap}
                    onInsights={handleInsights}
                    onMessageClick={onMessageClick}
                    locationFilter={locationData}
                  />
                </div>
              )}
            </div>

            {/* Location Based Section - Shows when scrolled down */}
            <div className="mt-8">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Nearby Properties</h3>
                <p className="text-white/70 text-sm">Find properties close to your location</p>
              </div>
              
              <Button 
                onClick={() => setLocationData(null)} // This would trigger location permission
                variant="outline"
                size="lg"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white border-orange-400 hover:border-orange-500"
              >
                📍 Enable Location
              </Button>
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