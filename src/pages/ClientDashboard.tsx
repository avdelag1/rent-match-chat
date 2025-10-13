import { useState, useEffect } from 'react';
import { TinderentSwipeContainer } from '@/components/TinderentSwipeContainer';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { SupportDialog } from '@/components/SupportDialog';
import { NotificationsDialog } from '@/components/NotificationsDialog';
import { CategoryFilters } from '@/components/CategoryFilters';
import { useListings } from '@/hooks/useListings';
import { useAuth } from '@/hooks/useAuth';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Menu, Flame, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientDashboardProps {
  onPropertyInsights?: (listingId: string) => void;
  onMessageClick?: () => void;
}

const ClientDashboard = ({ onPropertyInsights, onMessageClick }: ClientDashboardProps) => {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { savedFilters, loading: filtersLoading } = useSavedFilters();
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    city?: string;
    radius: number;
  } | null>(null);
  const { data: listings = [], isLoading, error, refetch } = useListings();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load saved filters on mount
  useEffect(() => {
    if (savedFilters) {
      setAppliedFilters({
        category: savedFilters.category,
        mode: savedFilters.mode,
        ...savedFilters.filters
      });
    }
  }, [savedFilters]);
  
  const handleListingTap = (listingId: string) => {
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

  const handleMenuAction = (action: string) => {
    console.log('[ClientDashboard] Menu action:', action);
    if (action === 'premium-packages') {
      navigate('/subscription-packages');
    } else if (action === 'support') {
      setShowSupport(true);
    } else if (action === 'filters') {
      setShowFilters(true);
    } else if (action === 'notifications') {
      setShowNotifications(true);
    }
  };

  const selectedListing = listings.find(l => l.id === selectedListingId);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">
        <AppSidebar userRole="client" onMenuItemClick={handleMenuAction} />
        
        <main className="flex-1 relative overflow-hidden">
          {/* Minimal Header */}
          <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
            <SidebarTrigger className="bg-white/20 hover:bg-white/30 text-white border-white/20" />
            <div className="text-white text-lg font-semibold">
              Discover
            </div>
            {/* Removed refresh button - undo is now in the swipe container */}
          </header>

          {/* Full Screen Swipe Container */}
          <div className="absolute inset-0 pt-16 pb-6 px-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin text-white">
                  <Flame className="w-8 h-8" />
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-white">
                <div className="text-6xl mb-4">😞</div>
                <h3 className="text-xl font-bold mb-2">Error loading</h3>
                <p className="text-white/80 mb-4">Please try again.</p>
                <Button 
                  onClick={() => refetch()}
                  variant="outline"
                  className="gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-white">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-bold mb-2">No Properties Found</h3>
                <p className="text-white/80 mb-4">Try adjusting filters or check back later.</p>
                <Button 
                  onClick={() => refetch()}
                  variant="outline"
                  className="gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <RotateCcw className="w-4 h-4" />
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
        </main>
      </div>

      <PropertyInsightsDialog
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
        listing={selectedListing || null}
      />

      <SupportDialog
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        userRole="client"
      />

      <NotificationsDialog
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <CategoryFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        currentFilters={appliedFilters}
        onApplyFilters={(filters) => {
          setAppliedFilters(filters);
          console.log('Applied filters:', filters);
          setShowFilters(false);
        }}
      />
    </SidebarProvider>
  );
};

export default ClientDashboard;