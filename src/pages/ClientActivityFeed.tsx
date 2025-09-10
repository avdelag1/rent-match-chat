import { DashboardLayout } from "@/components/DashboardLayout";
import { ActivityFeed } from "@/components/ActivityFeed";

const ClientActivityFeed = () => {
  return (
    <DashboardLayout userRole="client">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <ActivityFeed userRole="client" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientActivityFeed;