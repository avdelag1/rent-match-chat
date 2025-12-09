import { DashboardLayout } from "@/components/DashboardLayout";
import { ActivityFeed } from "@/components/ActivityFeed";

const OwnerActivityFeed = () => {
  return (
    <DashboardLayout userRole="owner">
      <div className="w-full h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
        <div className="max-w-4xl mx-auto">
          <ActivityFeed userRole="owner" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerActivityFeed;