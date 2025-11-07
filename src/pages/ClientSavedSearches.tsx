import { DashboardLayout } from "@/components/DashboardLayout";
import { SavedSearches } from "@/components/SavedSearches";

const ClientSavedSearches = () => {
  return (
    <DashboardLayout userRole="client">
      <div className="w-full h-full overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <SavedSearches userRole="client" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientSavedSearches;