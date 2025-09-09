
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TinderentSwipeContainer } from '@/components/TinderentSwipeContainer';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useListings } from '@/hooks/useListings';
import ProfileCompletionBanner from '@/components/ProfileCompletionBanner';
import QuickActions from '@/components/QuickActions';
import NotificationManager from '@/components/NotificationManager';

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
      <NotificationManager />
      <div className="min-h-screen bg-transparent p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <ProfileCompletionBanner />
          <QuickActions role="client" />
          
          {/* Welcome Section */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="glass-morphism rounded-2xl p-6 lg:p-8 mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">🏠 Find Your Dream Home</h1>
              <div className="w-24 h-1 bg-gradient-button mx-auto mb-4"></div>
              <p className="text-white/80 text-lg">Swipe through amazing properties tailored just for you</p>
              
              {/* Quick Stats */}
              <div className="flex justify-center space-x-8 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{listings.length}</div>
                  <div className="text-white/60 text-sm">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">AI</div>
                  <div className="text-white/60 text-sm">Powered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">24/7</div>
                  <div className="text-white/60 text-sm">Support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Swipe Section */}
          <div className="glass-morphism rounded-2xl p-6 lg:p-8 shadow-glow">
            <div className="flex items-center justify-center mb-6">
              <h2 className="text-xl lg:text-2xl font-semibold text-white">Start Swiping</h2>
              <span className="ml-2 text-2xl animate-heart-beat">💝</span>
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
