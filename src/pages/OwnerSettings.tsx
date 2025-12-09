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
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const OwnerSettings = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");

  // Support deep-linking to specific tabs via URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "subscription", "security", "properties", "screening", "leases", "analytics", "theme"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  return (
    <DashboardLayout userRole="owner">
      <div className="w-full h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-4">Owner Settings</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your account, properties, and business operations</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Horizontally scrollable tabs on mobile */}
            <div className="relative -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
              <TabsList className="w-max sm:w-full flex sm:grid sm:grid-cols-8 gap-1 p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
                <TabsTrigger value="profile" className="text-xs sm:text-sm text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Profile</TabsTrigger>
                <TabsTrigger value="subscription" className="text-xs sm:text-sm text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Subscription</TabsTrigger>
                <TabsTrigger value="security" className="text-xs sm:text-sm text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Security</TabsTrigger>
                <TabsTrigger value="properties" className="text-xs sm:text-sm text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Properties</TabsTrigger>
                <TabsTrigger value="screening" className="text-xs sm:text-sm text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Screening</TabsTrigger>
                <TabsTrigger value="leases" className="text-xs sm:text-sm text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Leases</TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs sm:text-sm text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Analytics</TabsTrigger>
                <TabsTrigger value="theme" className="text-xs sm:text-sm text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Theme</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile">
              <div className="p-4 sm:p-6 text-center bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 mt-4 sm:mt-6">
                <p className="text-gray-700 text-sm sm:text-base">Profile settings will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 sm:p-6">
                <PremiumSubscriptionManager userRole="owner" />
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 sm:p-6">
                <AccountSecurity userRole="owner" />
              </div>
            </TabsContent>

            <TabsContent value="properties" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 sm:p-6">
                <PropertyManagement />
              </div>
            </TabsContent>

            <TabsContent value="screening" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 sm:p-6">
                <TenantScreening />
              </div>
            </TabsContent>

            <TabsContent value="leases" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 sm:p-6">
                <LeaseManagement />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 sm:p-6">
                <RentalAnalytics />
              </div>
            </TabsContent>

            <TabsContent value="theme" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 sm:p-6">
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
