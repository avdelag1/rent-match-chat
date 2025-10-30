import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumSubscriptionManager } from "@/components/PremiumSubscriptionManager";
import { OwnerProfileDialog } from "@/components/OwnerProfileDialog";
import { AccountSecurity } from "@/components/AccountSecurity";
import { PropertyManagement } from "@/components/PropertyManagement";
import { TenantScreening } from "@/components/TenantScreening";
import { LeaseManagement } from "@/components/LeaseManagement";
import { RentalAnalytics } from "@/components/RentalAnalytics";
import { ThemeSelector } from "@/components/ThemeSelector";

const OwnerSettings = () => {
  return (
    <DashboardLayout userRole="owner">
      <div className="w-full h-full overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Owner Settings</h1>
            <p className="text-muted-foreground">Manage your account, properties, and business operations</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full gap-1 p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <TabsTrigger value="profile" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Profile</TabsTrigger>
              <TabsTrigger value="subscription" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Subscription</TabsTrigger>
              <TabsTrigger value="security" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Security</TabsTrigger>
              <TabsTrigger value="properties" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Properties</TabsTrigger>
              <TabsTrigger value="screening" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Screening</TabsTrigger>
              <TabsTrigger value="leases" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Leases</TabsTrigger>
              <TabsTrigger value="analytics" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Analytics</TabsTrigger>
              <TabsTrigger value="theme" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Theme</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="w-full h-full overflow-y-auto p-6 text-center bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 mt-6">
                <p className="text-gray-700">Profile settings will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <PremiumSubscriptionManager userRole="owner" />
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <AccountSecurity userRole="owner" />
              </div>
            </TabsContent>

            <TabsContent value="properties" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <PropertyManagement />
              </div>
            </TabsContent>

            <TabsContent value="screening" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <TenantScreening />
              </div>
            </TabsContent>

            <TabsContent value="leases" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <LeaseManagement />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <RentalAnalytics />
              </div>
            </TabsContent>

            <TabsContent value="theme" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <ThemeSelector />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerSettings;