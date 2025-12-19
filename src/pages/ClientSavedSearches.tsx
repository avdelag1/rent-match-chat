import { DashboardLayout } from "@/components/DashboardLayout";
import { SavedSearches } from "@/components/SavedSearches";
import { PageHeader } from "@/components/PageHeader";

const ClientSavedSearches = () => {
  return (
    <DashboardLayout userRole="client">
      <div className="w-full h-full overflow-y-auto pb-24">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <PageHeader 
              title="Saved Searches" 
              subtitle="Your saved search criteria"
            />
            <SavedSearches userRole="client" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientSavedSearches;
