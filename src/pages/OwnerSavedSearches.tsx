import { DashboardLayout } from "@/components/DashboardLayout";
import { SavedSearches } from "@/components/SavedSearches";

const OwnerSavedSearches = () => {
  return (
    <DashboardLayout userRole="owner">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <SavedSearches userRole="owner" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerSavedSearches;