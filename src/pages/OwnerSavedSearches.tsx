import { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { SavedSearches } from "@/components/SavedSearches";
import { Button } from "@/components/ui/button";
import { Settings, Users } from "lucide-react";
import { OwnerClientFilterDialog } from "@/components/OwnerClientFilterDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const OwnerSavedSearches = () => {
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const navigate = useNavigate();

  const handleApplyFilter = (filterId: string) => {
    toast({
      title: "Filter Applied",
      description: "Navigating to client discovery with your filter...",
    });
    navigate('/owner/client-discovery');
  };

  return (
    <DashboardLayout userRole="owner">
      <div className="w-full h-full overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 sm:pb-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Client Filters</h1>
              <p className="text-sm sm:text-base text-white/70 mt-1">Save and manage your ideal client search criteria</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/owner/client-discovery')}
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs sm:text-sm"
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">View Clients</span>
                <span className="sm:hidden">Clients</span>
              </Button>
              <Button
                onClick={() => setShowFilterDialog(true)}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm"
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Configure Filters</span>
                <span className="sm:hidden">Configure</span>
              </Button>
            </div>
          </div>
          
          <SavedSearches userRole="owner" onApplyFilter={handleApplyFilter} />
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