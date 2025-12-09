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
      <div className="w-full h-full overflow-y-auto p-3 sm:p-4 md:p-8 pb-24 sm:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-4">Owner Settings</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage your account, properties, and business operations</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <TabsTrigger value="profile" className="flex-1 min-w-[60px] text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-3 py-1.5 sm:py-2 text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Profile</TabsTrigger>
              <TabsTrigger value="subscription" className="flex-1 min-w-[60px] text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-3 py-1.5 sm:py-2 text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all"><span className="hidden sm:inline">Subscription</span><span className="sm:hidden">Sub</span></TabsTrigger>
              <TabsTrigger value="security" className="flex-1 min-w-[60px] text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-3 py-1.5 sm:py-2 text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Security</TabsTrigger>
              <TabsTrigger value="properties" className="flex-1 min-w-[60px] text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-3 py-1.5 sm:py-2 text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all"><span className="hidden sm:inline">Properties</span><span className="sm:hidden">Props</span></TabsTrigger>
              <TabsTrigger value="screening" className="flex-1 min-w-[60px] text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-3 py-1.5 sm:py-2 text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all"><span className="hidden sm:inline">Screening</span><span className="sm:hidden">Screen</span></TabsTrigger>
              <TabsTrigger value="leases" className="flex-1 min-w-[60px] text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-3 py-1.5 sm:py-2 text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Leases</TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1 min-w-[60px] text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-3 py-1.5 sm:py-2 text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all"><span className="hidden sm:inline">Analytics</span><span className="sm:hidden">Stats</span></TabsTrigger>
              <TabsTrigger value="theme" className="flex-1 min-w-[60px] text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-3 py-1.5 sm:py-2 text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Theme</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="w-full h-full overflow-y-auto p-4 sm:p-6 text-center bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 mt-4 sm:mt-6">
                <p className="text-gray-700">Profile settings will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-3 sm:p-6">
                <PremiumSubscriptionManager userRole="owner" />
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-3 sm:p-6">
                <AccountSecurity userRole="owner" />
              </div>
            </TabsContent>

            <TabsContent value="properties" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-3 sm:p-6">
                <PropertyManagement />
              </div>
            </TabsContent>

            <TabsContent value="screening" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-3 sm:p-6">
                <TenantScreening />
              </div>
            </TabsContent>

            <TabsContent value="leases" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-3 sm:p-6">
                <LeaseManagement />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-3 sm:p-6">
                <RentalAnalytics />
              </div>
            </TabsContent>

            <TabsContent value="theme" className="mt-4 sm:mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-3 sm:p-6">
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
