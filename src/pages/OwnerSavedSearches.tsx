import { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { SavedSearches } from "@/components/SavedSearches";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { OwnerClientFilterDialog } from "@/components/OwnerClientFilterDialog";

const OwnerSavedSearches = () => {
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  return (
    <DashboardLayout userRole="owner">
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Client Filters</h1>
              <p className="text-white/70 mt-1">Set up your ideal client criteria</p>
            </div>
            <Button
              onClick={() => setShowFilterDialog(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure Filters
            </Button>
          </div>
          
          <SavedSearches userRole="owner" />
        </div>
      </div>
      
      <OwnerClientFilterDialog 
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
      />
    </DashboardLayout>
  );
};

export default OwnerSavedSearches;