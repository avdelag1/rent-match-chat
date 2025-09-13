
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TinderentSwipeContainer } from '@/components/TinderentSwipeContainer';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useListings } from '@/hooks/useListings';
import { motion } from 'framer-motion';

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
      <div className="min-h-screen p-8"
           style={{ 
             background: 'linear-gradient(135deg, #ec4899 0%, #f97316 50%, #ea580c 100%)'
           }}>
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="pb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Discover Your Perfect Home</h1>
              <div className="w-24 h-1 bg-white/30 mx-auto"></div>
            </div>
          </motion.div>

          {/* Properties Section */}
          <motion.div 
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-xl font-semibold text-white text-center mb-8">Available Properties</h2>
            <div className="flex justify-center">
              <TinderentSwipeContainer 
                onListingTap={handleListingTap} 
                onInsights={handleInsights}
                onMessageClick={onMessageClick}
              />
            </div>
          </motion.div>
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
