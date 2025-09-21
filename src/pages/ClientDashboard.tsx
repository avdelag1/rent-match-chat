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
          <div className="w-full max-w-48 mx-auto px-1 pt-1 pb-2">
            {/* Header Section */}
            <div className="text-center mb-1">
              <h2 className="text-xs font-bold text-white">Find Properties</h2>
              <p className="text-white/80 text-xs leading-tight">
                {user?.user_metadata?.full_name || 'Welcome back!'}
              </p>
            </div>

            {/* Stats Quick View */}
            <div className="flex gap-1 justify-center mb-1">
              <div className="bg-white/10 rounded px-2 py-0.5 text-center">
                <p className="text-xs text-white/90">{listings.length}</p>
                <p className="text-xs text-white/70">Properties</p>
              </div>
              <div className="bg-white/10 rounded px-2 py-0.5 text-center">
                <p className="text-xs text-white/90">0</p>
                <p className="text-xs text-white/70">Matches</p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full">
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="space-y-1 w-full max-w-48">
                    <div className="animate-pulse">
                      <div className="w-full h-24 bg-white/10 rounded mb-1"></div>
                      <div className="h-2 bg-white/10 rounded w-3/4 mb-0.5"></div>
                      <div className="h-1 bg-white/10 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center space-y-1 py-2 text-center">
                  <div className="text-lg mb-0.5">😞</div>
                  <h3 className="text-xs font-bold text-white">Error loading</h3>
                  <p className="text-white/70 text-xs max-w-48 leading-tight">Please try again.</p>
                  <Button 
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                    className="gap-0.5 bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs py-0.5 h-5"
                  >
                    🔄 Try Again
                  </Button>
                </div>
              ) : listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-1 py-3 text-center">
                  <div className="text-lg mb-0.5">🏠</div>
                  <h3 className="text-xs font-bold text-white">No Properties Found</h3>
                  <p className="text-white/70 text-xs max-w-48 leading-tight">Try adjusting filters.</p>
                  <Button 
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                    className="gap-0.5 bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs py-0.5 h-5"
                  >
                    🔄 Refresh
                  </Button>
                </div>
              ) : (
                <div className="w-full max-w-48 mx-auto">
                  <TinderentSwipeContainer
                    onListingTap={handleListingTap}
                    onInsights={handleInsights}
                    onMessageClick={onMessageClick}
                    locationFilter={locationData}
                  />
                </div>
              )}
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