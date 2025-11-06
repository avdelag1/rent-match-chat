import { DashboardLayout } from "@/components/DashboardLayout";
import { AccountSecurity } from "@/components/AccountSecurity";

const ClientSecurity = () => {
  return (
    <DashboardLayout userRole="client">
      <div className="p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto">
          <AccountSecurity userRole="client" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientSecurity;