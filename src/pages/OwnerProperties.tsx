import { useState } from 'react';
import { PropertyManagement } from "@/components/PropertyManagement";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useListings } from "@/hooks/useListings";

const OwnerProperties = () => {
  const { data: listings = [], isLoading, error } = useListings();

  const openAddProperty = () => {
    // Set hash so DashboardLayout opens the PropertyForm
    if (location.hash !== '#add-property') {
      location.hash = '#add-property';
    }
  };

  return (
    <DashboardLayout userRole="owner">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Show PropertyManagement component that displays actual properties */}
          <PropertyManagement />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerProperties;