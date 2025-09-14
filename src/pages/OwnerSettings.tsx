import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumSubscriptionManager } from "@/components/PremiumSubscriptionManager";
import { OwnerProfileDialog } from "@/components/OwnerProfileDialog";
import { AccountSecurity } from "@/components/AccountSecurity";
import { PropertyManagement } from "@/components/PropertyManagement";
import { TenantScreening } from "@/components/TenantScreening";
import { LeaseManagement } from "@/components/LeaseManagement";
import { RentalAnalytics } from "@/components/RentalAnalytics";

const OwnerSettings = () => {
  return (
    <DashboardLayout userRole="owner">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Owner Settings</h1>
            <p className="text-muted-foreground">Manage your account, properties, and business operations</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="screening">Screening</TabsTrigger>
              <TabsTrigger value="leases">Leases</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="p-6 text-center">
                <p className="text-muted-foreground">Profile settings will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="subscription">
              <PremiumSubscriptionManager userRole="owner" />
            </TabsContent>

            <TabsContent value="security">
              <AccountSecurity userRole="owner" />
            </TabsContent>

            <TabsContent value="properties">
              <PropertyManagement />
            </TabsContent>

            <TabsContent value="screening">
              <TenantScreening />
            </TabsContent>

            <TabsContent value="leases">
              <LeaseManagement />
            </TabsContent>

            <TabsContent value="analytics">
              <RentalAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerSettings;