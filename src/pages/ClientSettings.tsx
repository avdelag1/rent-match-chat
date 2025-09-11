import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PremiumSubscriptionManager } from "@/components/PremiumSubscriptionManager";
import { AccountSecurity } from "@/components/AccountSecurity";
import { ThemeSelector } from "@/components/ThemeSelector";
import { PropertySearch } from "@/components/PropertySearch";
import { ClientPreferencesDialog } from "@/components/ClientPreferencesDialog";

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
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="p-6 text-center">
                <p className="text-muted-foreground">Profile settings will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="subscription">
              <PremiumSubscriptionManager userRole="client" />
            </TabsContent>

            <TabsContent value="security">
              <AccountSecurity userRole="client" />
            </TabsContent>

            <TabsContent value="theme">
              <ThemeSelector />
            </TabsContent>

            <TabsContent value="search">
              <PropertySearch />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientSettings;