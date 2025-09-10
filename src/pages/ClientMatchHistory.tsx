import { DashboardLayout } from "@/components/DashboardLayout";
import { MatchHistory } from "@/components/MatchHistory";

const ClientMatchHistory = () => {
  return (
    <DashboardLayout userRole="client">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <MatchHistory userRole="client" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientMatchHistory;