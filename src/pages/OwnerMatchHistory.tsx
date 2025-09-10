import { DashboardLayout } from "@/components/DashboardLayout";
import { MatchHistory } from "@/components/MatchHistory";

const OwnerMatchHistory = () => {
  return (
    <DashboardLayout userRole="owner">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <MatchHistory userRole="owner" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerMatchHistory;