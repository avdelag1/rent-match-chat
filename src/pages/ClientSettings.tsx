import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumSubscriptionManager } from "@/components/PremiumSubscriptionManager";
import { AccountSecurity } from "@/components/AccountSecurity";
import { PropertySearch } from "@/components/PropertySearch";
import { ClientProfileSettings } from "@/components/ClientProfileSettings";
import { ClientPreferencesDialog } from "@/components/ClientPreferencesDialog";
import { ThemeSelector } from "@/components/ThemeSelector";

const ClientSettings = () => {
  return (
    <DashboardLayout userRole="client">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Client Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and search settings</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full gap-1 p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <TabsTrigger value="profile" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Profile</TabsTrigger>
              <TabsTrigger value="subscription" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Subscription</TabsTrigger>
              <TabsTrigger value="security" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Security</TabsTrigger>
              <TabsTrigger value="search" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Search</TabsTrigger>
              <TabsTrigger value="theme" className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all">Theme</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <ClientProfileSettings />
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <PremiumSubscriptionManager userRole="client" />
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <AccountSecurity userRole="client" />
              </div>
            </TabsContent>

            <TabsContent value="search" className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
                <PropertySearch />
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

export default ClientSettings;