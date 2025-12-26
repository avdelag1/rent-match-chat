import { DashboardLayout } from "@/components/DashboardLayout";
import { AccountSecurity } from "@/components/AccountSecurity";

const OwnerSecurity = () => {
  return (
    <DashboardLayout userRole="owner">
      <div className="w-full">
        <div className="p-4 sm:p-6 md:p-8 pb-24 sm:pb-8">
          <div className="max-w-4xl mx-auto">
            <AccountSecurity userRole="owner" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerSecurity;