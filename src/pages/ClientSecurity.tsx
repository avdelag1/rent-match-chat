import { DashboardLayout } from "@/components/DashboardLayout";
import { AccountSecurity } from "@/components/AccountSecurity";
import { PageHeader } from "@/components/PageHeader";
import { SwipeNavigationWrapper } from "@/components/SwipeNavigationWrapper";
import { clientSettingsRoutes } from "@/config/swipeNavigationRoutes";

const ClientSecurity = () => {
  return (
    <DashboardLayout userRole="client">
      <SwipeNavigationWrapper routes={clientSettingsRoutes}>
        <div className="w-full pb-24">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <PageHeader
                title="Security"
                subtitle="Manage your account security settings"
              />
              <AccountSecurity userRole="client" />
            </div>
          </div>
        </div>
      </SwipeNavigationWrapper>
    </DashboardLayout>
  );
};

export default ClientSecurity;
