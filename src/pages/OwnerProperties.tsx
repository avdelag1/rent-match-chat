import { useState, useEffect } from 'react';
import { PropertyManagement } from "@/components/PropertyManagement";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const OwnerProperties = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [initialCategory, setInitialCategory] = useState<string | null>(null);
  const [initialMode, setInitialMode] = useState<string | null>(null);

  useEffect(() => {
    // Check for category and mode in search params
    const category = searchParams.get('category');
    const mode = searchParams.get('mode');
    if (category) {
      setInitialCategory(category);
      setInitialMode(mode);
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
      <div className="w-full overflow-x-hidden">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <PropertyManagement initialCategory={initialCategory} initialMode={initialMode} />
      </div>
    </DashboardLayout>
  );
};

export default OwnerProperties;