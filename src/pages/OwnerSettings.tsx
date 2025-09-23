import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumSubscriptionManager } from "@/components/PremiumSubscriptionManager";
import { OwnerProfileDialog } from "@/components/OwnerProfileDialog";
import { AccountSecurity } from "@/components/AccountSecurity";
import { PropertyManagement } from "@/components/PropertyManagement";
import { TenantScreening } from "@/components/TenantScreening";
import { LeaseManagement } from "@/components/LeaseManagement";
import { RentalAnalytics } from "@/components/RentalAnalytics";
import { ThemeSelector } from "@/components/ThemeSelector";
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const OwnerSettings = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-400 to-red-500">
        <AppSidebar userRole="owner" />
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 text-center">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-white/80">Manage your account, properties, and business operations</p>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-7xl mx-auto">
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
                  <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 mt-6">
                    <div className="text-center text-gray-700">
                      <p>Profile management features will be available here.</p>
                      <p className="text-sm text-gray-500 mt-2">Navigate to the Profile page for full profile editing capabilities.</p>
                    </div>
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
        </div>
      </div>
    </SidebarProvider>
  );
};

export default OwnerSettings;