import { DashboardLayout } from "@/components/DashboardLayout";
import { AccountSecurity } from "@/components/AccountSecurity";
import { SwipeNavigationWrapper } from "@/components/SwipeNavigationWrapper";
import { ownerSettingsRoutes } from "@/config/swipeNavigationRoutes";

const OwnerSecurity = () => {
  return (
    <DashboardLayout userRole="owner">
      <SwipeNavigationWrapper routes={ownerSettingsRoutes}>
        <div className="w-full">
          <div className="p-4 sm:p-6 md:p-8 pb-24 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <AccountSecurity userRole="owner" />
            </div>
          </div>
        </div>
      </SwipeNavigationWrapper>
    </DashboardLayout>
  );
};

export default OwnerSecurity;