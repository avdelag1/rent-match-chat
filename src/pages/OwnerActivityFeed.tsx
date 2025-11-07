import { DashboardLayout } from "@/components/DashboardLayout";
import { ActivityFeed } from "@/components/ActivityFeed";

const OwnerActivityFeed = () => {
  return (
    <DashboardLayout userRole="owner">
      <div className="w-full h-full overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <ActivityFeed userRole="owner" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerActivityFeed;