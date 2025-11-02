
import React, { ReactNode, useState, useEffect } from 'react'
import { useAuth } from "@/hooks/useAuth"
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { useNavigate, useLocation } from 'react-router-dom'

// New Mobile Navigation Components
import { TopBar } from '@/components/TopBar'
import { BottomNavigation } from '@/components/BottomNavigation'
import { FilterBottomSheet } from '@/components/FilterBottomSheet'
import { SettingsBottomSheet } from '@/components/SettingsBottomSheet'

// Dialogs and Forms
import { SubscriptionPackages } from "@/components/SubscriptionPackages"
import { LikedPropertiesDialog } from "@/components/LikedPropertiesDialog"
import { LegalDocumentsDialog } from "@/components/LegalDocumentsDialog"
import { ClientPreferencesDialog } from "@/components/ClientPreferencesDialog"
import { ClientProfileDialog } from "@/components/ClientProfileDialog"
import { PropertyDetails } from "@/components/PropertyDetails"
import { PropertyInsightsDialog } from "@/components/PropertyInsightsDialog"
import { ClientInsightsDialog } from "@/components/ClientInsightsDialog"
import { OwnerSettingsDialog } from '@/components/OwnerSettingsDialog'
import { OwnerProfileDialog } from '@/components/OwnerProfileDialog'
import OwnerClientSwipeDialog from '@/components/OwnerClientSwipeDialog'
import { SupportDialog } from '@/components/SupportDialog'
import { NotificationSystem } from '@/components/NotificationSystem'
import { NotificationsDialog } from '@/components/NotificationsDialog'
import { OnboardingFlow } from '@/components/OnboardingFlow'
import { CategorySelectionDialog } from '@/components/CategorySelectionDialog'
import { SavedSearchesDialog } from '@/components/SavedSearchesDialog'

// Hooks
import { useListings } from "@/hooks/useListings"
import { useClientProfiles } from "@/hooks/useClientProfiles"

interface DashboardLayoutProps {
  children: ReactNode
  userRole: 'client' | 'owner'
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [showSubscriptionPackages, setShowSubscriptionPackages] = useState(false)
  const [showLikedProperties, setShowLikedProperties] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
  const [showPropertyDetails, setShowPropertyDetails] = useState(false)
  const [showPropertyInsights, setShowPropertyInsights] = useState(false)
  const [showClientInsights, setShowClientInsights] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [subscriptionReason, setSubscriptionReason] = useState<string>('')

  // Owner dialogs
  const [showOwnerSettings, setShowOwnerSettings] = useState(false)
  const [showOwnerProfile, setShowOwnerProfile] = useState(false)
  const [showOwnerSwipe, setShowOwnerSwipe] = useState(false)

  // Other dialogs
  const [showLegalDocuments, setShowLegalDocuments] = useState(false)
  const [showSupport, setShowSupport] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  const [appliedFilters, setAppliedFilters] = useState<any>(null);

  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // Get listings and profiles data for insights with error handling
  const { data: listings = [], error: listingsError } = useListings();
  const { data: profiles = [], error: profilesError } = useClientProfiles();

  if (listingsError) {
    console.error('DashboardLayout - Listings error:', listingsError);
  }
  if (profilesError) {
    console.error('DashboardLayout - Profiles error:', profilesError);
  }

  // Check onboarding status and show flow if not completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.id || onboardingChecked) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, full_name, city, age')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          return;
        }

        setOnboardingChecked(true);

        // Show onboarding ONLY if:
        // 1. onboarding_completed is explicitly false, AND
        // 2. User has minimal profile data (likely a new user)
        const hasMinimalData = !data?.full_name && !data?.city && !data?.age;
        if (data?.onboarding_completed === false && hasMinimalData) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error in onboarding check:', error);
      }
    };

    checkOnboardingStatus();
  }, [user?.id, onboardingChecked]);

  const selectedListing = selectedListingId ? listings.find(l => l.id === selectedListingId) : null;
  const selectedProfile = selectedProfileId ? profiles.find(p => p.user_id === selectedProfileId) : null;

  const handleLikedPropertySelect = (listingId: string) => {
    setSelectedListingId(listingId)
    setShowPropertyDetails(true)
  }

  const handleMessageClick = () => {
    const roleText = userRole === 'owner' ? 'clients' : 'owners'
    setSubscriptionReason(`Unlock messaging to connect with ${roleText}!`)
    setShowSubscriptionPackages(true)
  }

  const handlePropertyInsights = (listingId: string) => {
    setSelectedListingId(listingId)
    setShowPropertyInsights(true)
  }

  const handleClientInsights = (profileId: string) => {
    setSelectedProfileId(profileId)
    setShowClientInsights(true)
  }

  const handleFilterClick = () => {
    setShowFilters(true)
  }

  const handleAddListingClick = () => {
    setShowCategoryDialog(true)
  }

  const handleNotificationsClick = () => {
    setShowNotifications(true)
  }

  const handleSettingsClick = () => {
    setShowSettingsMenu(true)
  }

  const handleMenuItemClick = (action: string) => {
    switch (action) {
      case 'add-listing':
        setShowCategoryDialog(true)
        break
      case 'saved-searches':
        setShowSavedSearches(true)
        break
      case 'legal-documents':
        setShowLegalDocuments(true)
        break
      case 'premium-packages':
        setSubscriptionReason('Choose the perfect plan for your needs!')
        setShowSubscriptionPackages(true)
        break
      case 'support':
        setShowSupport(true)
        break
      default:
        break
    }
  }

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    setAppliedFilters(filters);

    // Count active filters for user feedback
    let activeFilterCount = 0;
    if (filters.propertyType?.length) activeFilterCount += filters.propertyType.length;
    if (filters.bedrooms?.length) activeFilterCount += filters.bedrooms.length;
    if (filters.bathrooms?.length) activeFilterCount += filters.bathrooms.length;
    if (filters.amenities?.length) activeFilterCount += filters.amenities.length;
    if (filters.priceRange) activeFilterCount += 1;

    toast({
      title: '✨ Filters Applied',
      description: activeFilterCount > 0
        ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`
        : 'Showing all listings',
    });
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background relative">
      <NotificationSystem />

      {/* Top Bar - Fixed */}
      <TopBar
        onNotificationsClick={handleNotificationsClick}
        onSettingsClick={handleSettingsClick}
      />

      {/* Main Content - Full screen area for card feed */}
      <main className="fixed inset-0 pt-14 pb-16">
        <div className="w-full h-full">{
          React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement, {
                onPropertyInsights: handlePropertyInsights,
                onClientInsights: handleClientInsights,
                onMessageClick: handleMessageClick,
                filters: appliedFilters,
              } as any);
            }
            return child;
          })
        }
        </div>
      </main>

      {/* Bottom Navigation - Fixed */}
      <BottomNavigation
        userRole={userRole}
        onFilterClick={handleFilterClick}
        onAddListingClick={handleAddListingClick}
      />

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        userRole={userRole}
      />

      {/* Settings/More Menu Bottom Sheet */}
      <SettingsBottomSheet
        isOpen={showSettingsMenu}
        onClose={() => setShowSettingsMenu(false)}
        userRole={userRole}
        onMenuItemClick={handleMenuItemClick}
      />

      {/* All Dialogs/Modals */}
      <SubscriptionPackages
        isOpen={showSubscriptionPackages}
        onClose={() => setShowSubscriptionPackages(false)}
        reason={subscriptionReason}
        userRole={userRole}
      />

      {userRole === 'client' && (
        <>
          <LikedPropertiesDialog
            isOpen={showLikedProperties}
            onClose={() => setShowLikedProperties(false)}
            onPropertySelect={handleLikedPropertySelect}
          />

          <ClientPreferencesDialog
            open={showPreferences}
            onOpenChange={setShowPreferences}
          />

          <ClientProfileDialog
            open={showProfile}
            onOpenChange={setShowProfile}
          />

          <PropertyDetails
            listingId={selectedListingId}
            isOpen={showPropertyDetails}
            onClose={() => {
              setShowPropertyDetails(false)
              setSelectedListingId(null)
            }}
            onMessageClick={handleMessageClick}
          />

          <PropertyInsightsDialog
            open={showPropertyInsights}
            onOpenChange={(open) => {
              setShowPropertyInsights(open)
              if (!open) setSelectedListingId(null)
            }}
            listing={selectedListing || null}
          />

          <SavedSearchesDialog
            open={showSavedSearches}
            onOpenChange={setShowSavedSearches}
          />
        </>
      )}

      {userRole === 'owner' && (
        <>
          <ClientInsightsDialog
            open={showClientInsights}
            onOpenChange={(open) => {
              setShowClientInsights(open)
              if (!open) setSelectedProfileId(null)
            }}
            profile={selectedProfile || null}
          />

          <OwnerSettingsDialog
            open={showOwnerSettings}
            onOpenChange={setShowOwnerSettings}
          />

          <OwnerProfileDialog
            open={showOwnerProfile}
            onOpenChange={setShowOwnerProfile}
          />

          <OwnerClientSwipeDialog
            open={showOwnerSwipe}
            onOpenChange={setShowOwnerSwipe}
          />

          <LegalDocumentsDialog
            open={showLegalDocuments}
            onOpenChange={setShowLegalDocuments}
          />

          <CategorySelectionDialog
            open={showCategoryDialog}
            onOpenChange={setShowCategoryDialog}
            onCategorySelect={(category, mode) => {
              setShowCategoryDialog(false);
              navigate('/owner/properties');
            }}
          />
        </>
      )}

      <SupportDialog
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
        userRole={userRole}
      />

      <NotificationsDialog
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <OnboardingFlow
        open={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          toast({
            title: 'Profile Complete!',
            description: 'Welcome to TindeRent. Start exploring!',
          });
        }}
      />
    </div>
  )
}
