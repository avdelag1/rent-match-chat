import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { TinderentSwipeContainer } from '@/components/TinderentSwipeContainer';
import { PropertyInsightsDialog } from '@/components/PropertyInsightsDialog';
import { supabase } from '@/integrations/supabase/client';
import { ListingFilters } from '@/hooks/useSmartMatching';
import { Listing } from '@/hooks/useListings';
import type { DashboardOutletContext } from '@/components/DashboardLayout';

/**
 * SPEED OF LIGHT: Client Dashboard
 * DashboardLayout is now rendered ONCE at route level via PersistentDashboardLayout
 * This component only renders its inner content
 * FIXED: Uses useOutletContext to receive filters from DashboardLayout
 */
export default function ClientDashboard() {
  const { filters, onPropertyInsights: parentOnPropertyInsights, onMessageClick } = useOutletContext<DashboardOutletContext>();
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  // PERFORMANCE: Only fetch the selected listing when dialog opens
  const { data: selectedListing } = useQuery({
    queryKey: ['listing-detail', selectedListingId],
    queryFn: async () => {
      if (!selectedListingId) return null;
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', selectedListingId)
        .single();
      if (error) throw error;
      return data as Listing;
    },
    enabled: !!selectedListingId && insightsOpen,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const handleListingTap = useCallback((listingId: string) => {
    setSelectedListingId(listingId);
    setInsightsOpen(true);
    parentOnPropertyInsights?.(listingId);
  }, [parentOnPropertyInsights]);

  return (
    <>
      <TinderentSwipeContainer
        onListingTap={handleListingTap}
        onInsights={handleListingTap}
        onMessageClick={onMessageClick}
        filters={filters}
      />

      <PropertyInsightsDialog
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
        listing={selectedListing ?? null}
      />
    </>
  );
}
