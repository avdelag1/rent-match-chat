import { DashboardLayout } from "@/components/DashboardLayout";
import { useSearchParams, useNavigate } from "react-router-dom";
import { UnifiedListingForm } from "@/components/UnifiedListingForm";
import { useEffect, useState } from "react";

const OwnerNewListing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const modeParam = searchParams.get('mode');
    
    const category = categoryParam && ['property', 'yacht', 'motorcycle', 'bicycle'].includes(categoryParam)
      ? categoryParam
      : 'property';
    
    const mode = modeParam && ['rent', 'sale', 'both'].includes(modeParam)
      ? modeParam
      : 'rent';
    
    setInitialData({ category, mode });
  }, [searchParams]);

  const handleClose = () => {
    setIsFormOpen(false);
    // Navigate back to properties page
    navigate('/owner/properties');
  };

  if (!initialData) {
    return (
      <DashboardLayout userRole="owner">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="owner">
      <UnifiedListingForm
        isOpen={isFormOpen}
        onClose={handleClose}
        editingProperty={initialData}
      />
    </DashboardLayout>
  );
};

export default OwnerNewListing;
