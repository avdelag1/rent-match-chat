import { DashboardLayout } from "@/components/DashboardLayout";
import { AccountSecurity } from "@/components/AccountSecurity";

const OwnerSecurity = () => {
  return (
    <DashboardLayout userRole="owner">
      <div className="w-full h-full overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <AccountSecurity userRole="owner" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerSecurity;