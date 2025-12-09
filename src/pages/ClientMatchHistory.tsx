import { DashboardLayout } from "@/components/DashboardLayout";
import { MatchHistory } from "@/components/MatchHistory";

const ClientMatchHistory = () => {
  return (
    <DashboardLayout userRole="client">
      <div className="w-full h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
        <div className="max-w-4xl mx-auto">
          <MatchHistory userRole="client" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientMatchHistory;