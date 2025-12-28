
import React, { ReactNode, useState, useEffect, useCallback, useMemo, lazy, Suspense, useRef } from 'react'
import { useAuth } from "@/hooks/useAuth"
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import { useResponsiveContext } from '@/contexts/ResponsiveContext'

// New Mobile Navigation Components
import { TopBar } from '@/components/TopBar'
import { BottomNavigation } from '@/components/BottomNavigation'
import { AdvancedFilters } from '@/components/AdvancedFilters'
import { QuickFilterBar, QuickFilters, QuickFilterCategory } from '@/components/QuickFilterBar'

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

  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  const [quickFilters, setQuickFilters] = useState<QuickFilters>({
    categories: [],
    listingType: 'both',
    clientGender: 'any',
    clientType: 'all',
  });

  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const responsive = useResponsiveContext()

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
    if (userRole === 'owner') {
      navigate('/owner/filters-explore')
    } else {
      setShowFilters(true)
    }
  }, [userRole, navigate])

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
    navigate(userRole === 'client' ? '/client/settings' : '/owner/settings')
  }, [navigate, userRole])

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
    // Convert AdvancedFilters format to ListingFilters format
    const convertedFilters: any = {
      ...filters,
      propertyType: filters.propertyTypes, // propertyTypes -> propertyType
      listingType: filters.listingTypes?.length === 1 ? filters.listingTypes[0] :
                   filters.listingTypes?.includes('rent') && filters.listingTypes?.includes('buy') ? 'both' :
                   filters.listingTypes?.[0] || 'rent',
      petFriendly: filters.petFriendly === 'yes' || filters.petFriendly === true,
      furnished: filters.furnished === 'yes' || filters.furnished === true,
      verified: filters.verified || false,
      premiumOnly: filters.premiumOnly || false,
    };

    setAppliedFilters(convertedFilters);

    // Count active filters for user feedback
    let activeFilterCount = 0;
    if (convertedFilters.propertyType?.length) activeFilterCount += convertedFilters.propertyType.length;
    if (convertedFilters.bedrooms?.length) activeFilterCount += convertedFilters.bedrooms.length;
    if (convertedFilters.bathrooms?.length) activeFilterCount += convertedFilters.bathrooms.length;
    if (convertedFilters.amenities?.length) activeFilterCount += convertedFilters.amenities.length;
    if (convertedFilters.priceRange) activeFilterCount += 1;

    toast({
      title: '✨ Filters Applied',
      description: activeFilterCount > 0
        ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`
        : 'Showing all listings',
    });
  }, [])

  // Handle quick filter changes
  const handleQuickFilterChange = useCallback((newQuickFilters: QuickFilters) => {
    setQuickFilters(newQuickFilters);
  }, []);

  // Combine quick filters with applied filters
  const combinedFilters = useMemo(() => {
    const base = appliedFilters || {};

    // Check if any quick filters are active
    const hasClientQuickFilters = quickFilters.categories.length > 0 ||
                                   quickFilters.listingType !== 'both';
    const hasOwnerQuickFilters = (quickFilters.clientGender && quickFilters.clientGender !== 'any') ||
                                  (quickFilters.clientType && quickFilters.clientType !== 'all');

    // If no quick filters active, return base filters
    if (!hasClientQuickFilters && !hasOwnerQuickFilters) {
      return base;
    }

    // Check if services category is selected
    const hasServicesCategory = quickFilters.categories.includes('services');

    return {
      ...base,
      // Client quick filter categories take precedence if set
      category: quickFilters.categories.length === 0 ? base.category : undefined,
      categories: quickFilters.categories.length > 0 ? quickFilters.categories : undefined,
      // Quick filter listing type takes precedence if not 'both'
      listingType: quickFilters.listingType !== 'both' ? quickFilters.listingType : base.listingType,
      // Services filter - derived from categories
      showHireServices: hasServicesCategory || undefined,
      // Owner quick filters
      clientGender: quickFilters.clientGender !== 'any' ? quickFilters.clientGender : undefined,
      clientType: quickFilters.clientType !== 'all' ? quickFilters.clientType : undefined,
    };
  }, [appliedFilters, quickFilters]);

  // ✅ FIX: Memoize cloned children to prevent infinite re-renders
  const enhancedChildren = useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement, {
          onPropertyInsights: handlePropertyInsights,
          onClientInsights: handleClientInsights,
          onMessageClick: handleMessageClick,
          filters: combinedFilters,
        } as any);
      }
      return child;
    });
  }, [children, handlePropertyInsights, handleClientInsights, handleMessageClick, combinedFilters]);

  // Check if we're on a page that should show quick filters (client or owner discovery page)
  const showQuickFilters = (userRole === 'client' && location.pathname === '/client/dashboard') ||
                           (userRole === 'owner' && location.pathname === '/owner/dashboard');

  // Calculate responsive layout values
  const topBarHeight = responsive.isMobile ? 52 : 56;
  const quickFilterHeight = showQuickFilters ? (responsive.isMobile ? 48 : 52) : 0;
  const bottomNavHeight = responsive.isMobile ? 68 : 72;

  return (
    <div className="app-root bg-background min-h-screen min-h-dvh overflow-x-hidden" style={{ width: '100%', maxWidth: '100vw', position: 'relative' }}>
      <NotificationSystem />

      {/* Top Bar - Fixed with safe-area-top */}
      <TopBar
        onNotificationsClick={handleNotificationsClick}
        onSettingsClick={handleSettingsClick}
      />

      {/* Quick Filter Bar - For clients and owners on discovery pages */}
      {showQuickFilters && (
        <div
          className="fixed left-0 right-0 z-40"
          style={{
            top: `calc(${topBarHeight}px + var(--safe-top))`,
          }}
        >
          <QuickFilterBar
            filters={quickFilters}
            onChange={handleQuickFilterChange}
            userRole={userRole}
          />
        </div>
      )}

      {/* Main Content - Scrollable area with safe area spacing for fixed header/footer */}
      <main
        className="fixed inset-0 overflow-y-auto overflow-x-hidden scroll-area-momentum"
        style={{
          paddingTop: `calc(${topBarHeight + quickFilterHeight}px + var(--safe-top))`,
          paddingBottom: `calc(${bottomNavHeight}px + var(--safe-bottom))`,
          paddingLeft: 'max(var(--safe-left), 0px)',
          paddingRight: 'max(var(--safe-right), 0px)',
          width: '100%',
          maxWidth: '100vw',
        }}
      >
        {enhancedChildren}
      </main>

      {/* Bottom Navigation - Fixed with safe-area-bottom */}
      <BottomNavigation
        userRole={userRole}
        onFilterClick={handleFilterClick}
        onAddListingClick={handleAddListingClick}
        onListingsClick={handleListingsClick}
      />

      {/* Advanced Filters Dialog */}
      <AdvancedFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        userRole={userRole}
        currentFilters={appliedFilters ?? {}}
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
                description: 'Welcome to Swipess. Start exploring!',
              });
          }}
        />
      </Suspense>
    </div>
  )
}
