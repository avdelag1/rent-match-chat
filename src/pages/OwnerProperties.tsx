import { PageTransition } from '@/components/PageTransition';
import { useState, useEffect } from 'react';
import { PropertyManagement } from "@/components/PropertyManagement";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useSearchParams, useLocation } from "react-router-dom";

const OwnerProperties = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [initialCategory, setInitialCategory] = useState<string | null>(null);

  useEffect(() => {
    // Check for category in search params
    const category = searchParams.get('category');
    if (category) {
      setInitialCategory(category);
    }
    
    // Check for hash-based navigation (e.g., #add-yacht)
    const hash = location.hash;
    if (hash.startsWith('#add-')) {
      const hashCategory = hash.replace('#add-', '');
      setInitialCategory(hashCategory);
    }
  }, [searchParams, location.hash]);

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