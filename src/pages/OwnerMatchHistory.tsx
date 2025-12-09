import { DashboardLayout } from "@/components/DashboardLayout";
import { MatchHistory } from "@/components/MatchHistory";

const OwnerMatchHistory = () => {
  return (
    <DashboardLayout userRole="owner">
      <div className="w-full h-full overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 sm:pb-8">
        <div className="max-w-4xl mx-auto">
          <MatchHistory userRole="owner" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerMatchHistory;