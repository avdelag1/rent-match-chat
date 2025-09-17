
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

  // Main render function
  const renderDashboard = () => (
    <DashboardLayout userRole="client">
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Welcome Section */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
              <p className="text-gray-600 mt-1">
                {user?.user_metadata?.full_name || user?.email || 'Valued Client'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Find your dream home</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Location-based matching sidebar */}
            <div className="lg:col-span-1">
              <LocationBasedMatching
                onLocationUpdate={setLocationData}
                className="sticky top-6"
              />
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-3 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                  Error loading properties. 
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => refetch()}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Properties Section */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
                  {locationData ? `Properties within ${locationData.radius}km` : 'Available Properties'}
                  {locationData?.city && (
                    <span className="block text-sm text-gray-500 mt-1">Near {locationData.city}</span>
                  )}
                </h3>
            
            {isLoading ? (
              <div className="flex justify-center">
                <Skeleton className="w-full max-w-md h-[500px] rounded-xl" />
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
                <TinderentSwipeContainer
                  onListingTap={handleListingTap} 
                  onInsights={handleInsights}
                  onMessageClick={onMessageClick}
                  locationFilter={locationData}
                />
              )}
              </div>
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

  return renderDashboard();
};

export default ClientDashboard;
