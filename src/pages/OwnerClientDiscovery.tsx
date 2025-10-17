import { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { ClientSwipeContainer } from "@/components/ClientSwipeContainer";
import { Button } from "@/components/ui/button";
import { Filter, Zap, MapPin } from "lucide-react";
import { OwnerClientFilterDialog } from "@/components/OwnerClientFilterDialog";

const OwnerClientDiscovery = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [smartMatchEnabled, setSmartMatchEnabled] = useState(false);
  const [showNearby, setShowNearby] = useState(false);

  return (
    <DashboardLayout userRole="owner">
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Discover Clients</h1>
            <p className="text-muted-foreground">Swipe to find your perfect tenants</p>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button
              variant={smartMatchEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setSmartMatchEnabled(!smartMatchEnabled)}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Smart Match
            </Button>
            <Button
              variant={showNearby ? "default" : "outline"}
              size="sm"
              onClick={() => setShowNearby(!showNearby)}
              className="gap-2"
            >
              <MapPin className="w-4 h-4" />
              Show Nearby
            </Button>
          </div>

          {/* Client Swipe Container */}
          <ClientSwipeContainer
            onClientTap={() => {}}
            onInsights={() => {}}
            onMessageClick={() => {}}
          />
        </div>
      </div>

      {/* Filters Dialog */}
      <OwnerClientFilterDialog
        open={showFilters}
        onOpenChange={setShowFilters}
      />
    </DashboardLayout>
  );
};

export default OwnerClientDiscovery;
