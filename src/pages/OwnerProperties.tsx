import { useState, useEffect } from 'react';
import { PropertyManagement } from "@/components/PropertyManagement";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useListings } from "@/hooks/useListings";
import { useSearchParams } from "react-router-dom";

const OwnerProperties = () => {
  const { data: listings = [], isLoading, error } = useListings();
  const [searchParams] = useSearchParams();
  const [initialCategory, setInitialCategory] = useState<string | null>(null);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setInitialCategory(category);
    }
  }, [searchParams]);

  return (
    <DashboardLayout userRole="owner">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Show PropertyManagement component that displays actual properties */}
          <PropertyManagement initialCategory={initialCategory} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerProperties;