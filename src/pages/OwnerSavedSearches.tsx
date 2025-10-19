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
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Client Filters</h1>
              <p className="text-white/70 mt-1">Save and manage your ideal client search criteria</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/owner/client-discovery')}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Users className="w-4 h-4 mr-2" />
                View Clients
              </Button>
              <Button
                onClick={() => setShowFilterDialog(true)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure Filters
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