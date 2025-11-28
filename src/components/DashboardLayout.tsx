
import React, { ReactNode, useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { useAuth } from "@/hooks/useAuth"
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'

// New Mobile Navigation Components
import { TopBar } from '@/components/TopBar'
import { BottomNavigation } from '@/components/BottomNavigation'
import { FilterBottomSheet } from '@/components/FilterBottomSheet'
import { SettingsBottomSheet } from '@/components/SettingsBottomSheet'

// Lazy-loaded Dialogs (improves bundle size and initial load)
const SubscriptionPackages = lazy(() => import("@/components/SubscriptionPackages").then(m => ({ default: m.SubscriptionPackages })))
const LikedPropertiesDialog = lazy(() => import("@/components/LikedPropertiesDialog").then(m => ({ default: m.LikedPropertiesDialog })))
const LegalDocumentsDialog = lazy(() => import("@/components/LegalDocumentsDialog").then(m => ({ default: m.LegalDocumentsDialog })))
const ClientPreferencesDialog = lazy(() => import("@/components/ClientPreferencesDialog").then(m => ({ default: m.ClientPreferencesDialog })))
const ClientProfileDialog = lazy(() => import("@/components/ClientProfileDialog").then(m => ({ default: m.ClientProfileDialog })))
const PropertyDetails = lazy(() => import("@/components/PropertyDetails").then(m => ({ default: m.PropertyDetails })))
const PropertyInsightsDialog = lazy(() => import("@/components/PropertyInsightsDialog").then(m => ({ default: m.PropertyInsightsDialog })))
const ClientInsightsDialog = lazy(() => import("@/components/ClientInsightsDialog").then(m => ({ default: m.ClientInsightsDialog })))
const OwnerSettingsDialog = lazy(() => import('@/components/OwnerSettingsDialog').then(m => ({ default: m.OwnerSettingsDialog })))
const OwnerProfileDialog = lazy(() => import('@/components/OwnerProfileDialog').then(m => ({ default: m.OwnerProfileDialog })))
const OwnerClientSwipeDialog = lazy(() => import('@/components/OwnerClientSwipeDialog'))
const SupportDialog = lazy(() => import('@/components/SupportDialog').then(m => ({ default: m.SupportDialog })))
const NotificationSystem = lazy(() => import('@/components/NotificationSystem').then(m => ({ default: m.NotificationSystem })))
const NotificationsDialog = lazy(() => import('@/components/NotificationsDialog').then(m => ({ default: m.NotificationsDialog })))
const OnboardingFlow = lazy(() => import('@/components/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })))
const CategorySelectionDialog = lazy(() => import('@/components/CategorySelectionDialog').then(m => ({ default: m.CategorySelectionDialog })))
const SavedSearchesDialog = lazy(() => import('@/components/SavedSearchesDialog').then(m => ({ default: m.SavedSearchesDialog })))

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

  // Lazy load listings and profiles only when insights dialogs are opened
  // This prevents unnecessary API calls on every page load
  const { data: listings = [], error: listingsError } = useListings([], {
    enabled: showPropertyInsights || showClientInsights
  });
  const { data: profiles = [], error: profilesError } = useClientProfiles([], {
    enabled: showClientInsights
  });

  if (listingsError && (showPropertyInsights || showClientInsights)) {
    console.error('DashboardLayout - Listings error:', listingsError);
  }
  if (profilesError && showClientInsights) {
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
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding status:', error);
          return;
        }

        if (!data) {
          console.log('No profile found for user');
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

  // ✅ FIX: Memoize all handler functions to prevent infinite re-renders
  const handleLikedPropertySelect = useCallback((listingId: string) => {
    setSelectedListingId(listingId)
    setShowPropertyDetails(true)
  }, [])

  const handleMessageClick = useCallback(() => {
    const roleText = userRole === 'owner' ? 'clients' : 'owners'
    setSubscriptionReason(`Unlock messaging to connect with ${roleText}!`)
    setShowSubscriptionPackages(true)
  }, [userRole])

  const handlePropertyInsights = useCallback((listingId: string) => {
    setSelectedListingId(listingId)
    setShowPropertyInsights(true)
  }, [])

  const handleClientInsights = useCallback((profileId: string) => {
    setSelectedProfileId(profileId)
    setShowClientInsights(true)
  }, [])

  const handleFilterClick = useCallback(() => {
    setShowFilters(true)
  }, [])

  const handleAddListingClick = useCallback(() => {
    setShowCategoryDialog(true)
  }, [])

  const handleListingsClick = useCallback(() => {
    navigate('/owner/properties');
  }, [navigate])

  const handleNotificationsClick = useCallback(() => {
    setShowNotifications(true)
  }, [])

  const handleSettingsClick = useCallback(() => {
    setShowSettingsMenu(true)
  }, [])

  const handleMenuItemClick = useCallback((action: string) => {
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
  }, [])

  const handleApplyFilters = useCallback((filters: any) => {
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
  }, [])

  // ✅ FIX: Memoize cloned children to prevent infinite re-renders
  const enhancedChildren = useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement, {
          onPropertyInsights: handlePropertyInsights,
          onClientInsights: handleClientInsights,
          onMessageClick: handleMessageClick,
          filters: appliedFilters,
        } as any);
      }
      return child;
    });
  }, [children, handlePropertyInsights, handleClientInsights, handleMessageClick, appliedFilters]);

  // Check if running on native platform for safe area padding
  const isNativePlatform = Capacitor.isNativePlatform();

  // Add safe area padding for native platforms to avoid status bar overlap
  // Minimal padding for full-screen card experience
  const mainPaddingClass = isNativePlatform
    ? 'pt-[calc(env(safe-area-inset-top,0px)+0rem)] pb-[calc(env(safe-area-inset-bottom,0px)+0rem)]'
    : 'pt-0 pb-0';

  return (
    <div className="min-h-screen flex flex-col w-full bg-background relative">
      <NotificationSystem />

      {/* Top Bar - Fixed */}
      <TopBar
        onNotificationsClick={handleNotificationsClick}
        onSettingsClick={handleSettingsClick}
        onFiltersClick={() => navigate('/owner/filters-explore')}
        showFilters={userRole === 'owner'}
      />

      {/* Main Content - Full screen area for card feed with proper scrolling */}
      <main className={`fixed top-10 left-0 right-0 bottom-16 overflow-hidden ${mainPaddingClass}`}>
        <div className="w-full h-full overflow-y-auto">
          {enhancedChildren}
        </div>
      </main>

      {/* Bottom Navigation - Fixed */}
      <BottomNavigation
        userRole={userRole}
        onFilterClick={handleFilterClick}
        onAddListingClick={handleAddListingClick}
        onListingsClick={handleListingsClick}
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
      <Suspense fallback={null}>
        <SubscriptionPackages
          isOpen={showSubscriptionPackages}
          onClose={() => setShowSubscriptionPackages(false)}
          reason={subscriptionReason}
          userRole={userRole}
        />
      </Suspense>

      {userRole === 'client' && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}

      {userRole === 'owner' && (
        <Suspense fallback={null}>
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
                navigate(`/owner/properties?category=${category}&mode=${mode}`);
              }}
            />
          </>
        </Suspense>
      )}

      <Suspense fallback={null}>
        <SupportDialog
          isOpen={showSupport}
          onClose={() => setShowSupport(false)}
          userRole={userRole}
        />
      </Suspense>

      <Suspense fallback={null}>
        <NotificationsDialog
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      </Suspense>

      <Suspense fallback={null}>
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
      </Suspense>
    </div>
  )
}
