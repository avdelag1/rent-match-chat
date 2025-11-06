import { DashboardLayout } from "@/components/DashboardLayout";
import { useSearchParams, useNavigate } from "react-router-dom";
import { UnifiedListingForm } from "@/components/UnifiedListingForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

const OwnerNewListing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<'property' | 'yacht' | 'motorcycle' | 'bicycle'>('property');
  const [mode, setMode] = useState<'rent' | 'sale' | 'both'>('rent');

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const modeParam = searchParams.get('mode');
    
    if (categoryParam && ['property', 'yacht', 'motorcycle', 'bicycle'].includes(categoryParam)) {
      setCategory(categoryParam as 'property' | 'yacht' | 'motorcycle' | 'bicycle');
    }
    
    if (modeParam && ['rent', 'sale', 'both'].includes(modeParam)) {
      setMode(modeParam as 'rent' | 'sale' | 'both');
    }
  }, [searchParams]);

  const handleSuccess = () => {
    // Navigate back to properties page after successful creation
    navigate('/owner/properties');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <DashboardLayout userRole="owner">
      <div className="w-full h-full overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" onClick={handleCancel} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Listing</h1>
            <p className="text-muted-foreground">
              Fill in the details for your new {category} listing
            </p>
          </div>

          {/* Unified Listing Form */}
          <UnifiedListingForm
            initialData={{ category, mode }}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerNewListing;
