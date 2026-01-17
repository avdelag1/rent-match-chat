import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OwnerProfileDialog } from "@/components/OwnerProfileDialog";
import { AccountSecurity } from "@/components/AccountSecurity";
import { PropertyManagement } from "@/components/PropertyManagement";
import { ThemeSelector } from "@/components/ThemeSelector";
import { FilterColorPreferences } from "@/components/FilterColorPreferences";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOwnerProfile } from "@/hooks/useOwnerProfile";
import { Building2, Mail, MapPin, Phone, Edit, Camera, Palette, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ReferralInviteDialog } from "@/components/ReferralInviteDialog";

const OwnerSettings = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const { data: ownerProfile, isLoading: profileLoading } = useOwnerProfile();

  // Support deep-linking to specific tabs via URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "security", "properties", "appearance"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <DashboardLayout userRole="owner">
      <div className="w-full overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">Owner Settings</h1>
            <p className="text-gray-400 text-sm sm:text-base">Manage your account, properties, and business operations</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Horizontally scrollable tabs on mobile */}
            <div className="relative -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
              <TabsList className="w-max sm:w-full flex sm:grid sm:grid-cols-4 gap-1 p-1 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                <TabsTrigger value="profile" className="text-xs sm:text-sm text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Profile</TabsTrigger>
                <TabsTrigger value="security" className="text-xs sm:text-sm text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Security</TabsTrigger>
                <TabsTrigger value="properties" className="text-xs sm:text-sm text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4">Properties</TabsTrigger>
                <TabsTrigger value="appearance" className="text-xs sm:text-sm text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg font-medium transition-all whitespace-nowrap px-3 sm:px-4 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Appearance
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile" className="mt-4 sm:mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6">
                {profileLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-20 h-20 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center overflow-hidden cursor-pointer"
                          onClick={() => setShowProfileDialog(true)}
                        >
                          {ownerProfile?.profile_images?.[0] ? (
                            <img
                              src={ownerProfile.profile_images[0]}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-10 h-10 text-primary-foreground" />
                          )}
                        </div>
                        <button
                          onClick={() => setShowProfileDialog(true)}
                          className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Camera className="w-4 h-4 text-primary-foreground" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-white">
                          {ownerProfile?.business_name || 'Set up your business profile'}
                        </h2>
                        <p className="text-sm text-gray-400">
                          {ownerProfile?.business_description ?
                            ownerProfile.business_description.slice(0, 80) + (ownerProfile.business_description.length > 80 ? '...' : '')
                            : 'Add a description to help clients learn about your business'}
                        </p>
                      </div>
                    </div>

                    {/* Business Info Cards */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ownerProfile?.business_location && (
                        <Card className="bg-gray-700/50 border-gray-600/50">
                          <CardContent className="p-4 flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-xs text-gray-400">Location</p>
                              <p className="text-sm font-medium text-white">{ownerProfile.business_location}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {ownerProfile?.contact_email && (
                        <Card className="bg-gray-700/50 border-gray-600/50">
                          <CardContent className="p-4 flex items-center gap-3">
                            <Mail className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-xs text-gray-400">Email</p>
                              <p className="text-sm font-medium text-white">{ownerProfile.contact_email}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {ownerProfile?.contact_phone && (
                        <Card className="bg-gray-700/50 border-gray-600/50">
                          <CardContent className="p-4 flex items-center gap-3">
                            <Phone className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-xs text-gray-400">Phone</p>
                              <p className="text-sm font-medium text-white">{ownerProfile.contact_phone}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Edit Profile Button */}
                    <Button
                      onClick={() => setShowProfileDialog(true)}
                      className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Business Profile
                    </Button>
                  </div>
                )}
              </div>

              {/* Referral & Rewards Section */}
              <div className="mt-4 sm:mt-6 bg-gradient-to-br from-primary/10 via-primary/5 to-green-500/10 backdrop-blur-sm rounded-xl border border-primary/20 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">Invite Friends & Earn Rewards</h2>
                </div>
                <p className="text-gray-400 mb-4 text-xs sm:text-sm">
                  Share your invitation link with friends and you both get free message activations!
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Share your unique link</p>
                      <p className="text-xs text-gray-400">Invite friends via WhatsApp, email, or social media</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">They sign up with your link</p>
                      <p className="text-xs text-gray-400">Your friends create a new account</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 font-bold">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">You both get free messages!</p>
                      <p className="text-xs text-gray-400">You get 1 free message, they get 2 free messages</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setShowReferralDialog(true)}
                  size="lg"
                  className="w-full mt-4 bg-gradient-to-r from-primary to-green-500 hover:from-primary/90 hover:to-green-500/90"
                >
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Share My Invitation Link
                </Button>
              </div>
            </TabsContent>


            <TabsContent value="security" className="mt-4 sm:mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6">
                <AccountSecurity userRole="owner" />
              </div>
            </TabsContent>

            <TabsContent value="properties" className="mt-4 sm:mt-6">
              <div className="rounded-xl overflow-hidden">
                <PropertyManagement />
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-4 sm:mt-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Theme Selector */}
                <ThemeSelector />

                {/* Filter Color Preferences */}
                <FilterColorPreferences />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Owner Profile Edit Dialog */}
      <OwnerProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
      />

      {/* Referral Invite Dialog */}
      <ReferralInviteDialog
        open={showReferralDialog}
        onOpenChange={setShowReferralDialog}
      />
    </DashboardLayout>
  );
};

export default OwnerSettings;
