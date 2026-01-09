/** SPEED OF LIGHT: DashboardLayout is now rendered at route level */
import { AccountSecurity } from "@/components/AccountSecurity";
import { SwipeNavigationWrapper } from "@/components/SwipeNavigationWrapper";
import { ownerSettingsRoutes } from "@/config/swipeNavigationRoutes";

const OwnerSecurity = () => {
  return (
    <>
      <SwipeNavigationWrapper routes={ownerSettingsRoutes}>
        <div className="w-full">
          <div className="p-4 sm:p-6 md:p-8 pb-24 sm:pb-8">
            <div className="max-w-4xl mx-auto">
              <AccountSecurity userRole="owner" />
            </div>
          </div>
        </div>
      </SwipeNavigationWrapper>
    </>
  );
};

export default OwnerSecurity;