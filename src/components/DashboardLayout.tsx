
import React, { ReactNode, useState, useEffect } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Flame } from 'lucide-react'
import AppSidebar from "@/components/AppSidebar"
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload"
import { useAuth } from "@/hooks/useAuth"
import { PropertyForm } from "@/components/PropertyForm"
import { SubscriptionPackages } from "@/components/SubscriptionPackages"
import { LikedPropertiesDialog } from "@/components/LikedPropertiesDialog"
import { LegalDocumentsDialog } from "@/components/LegalDocumentsDialog"
import { ClientPreferencesDialog } from "@/components/ClientPreferencesDialog"
import { ClientProfileDialog } from "@/components/ClientProfileDialog"
import { PropertyDetails } from "@/components/PropertyDetails"
import { PropertyInsightsDialog } from "@/components/PropertyInsightsDialog"
import { ClientInsightsDialog } from "@/components/ClientInsightsDialog"
import { useListings } from "@/hooks/useListings"
import { useClientProfiles } from "@/hooks/useClientProfiles"
import { toast } from '@/hooks/use-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import { OwnerSettingsDialog } from '@/components/OwnerSettingsDialog'
import { OwnerProfileDialog } from '@/components/OwnerProfileDialog'
import OwnerClientSwipeDialog from '@/components/OwnerClientSwipeDialog'
import { SupportDialog } from '@/components/SupportDialog'
import { NotificationSystem } from '@/components/NotificationSystem'
import { NotificationsDialog } from '@/components/NotificationsDialog'
import { CategoryFilters } from '@/components/CategoryFilters'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: ReactNode
  userRole: 'client' | 'owner'
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<any>(null)
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

  // NEW: owner dialogs
  const [showOwnerSettings, setShowOwnerSettings] = useState(false)
  const [showOwnerProfile, setShowOwnerProfile] = useState(false)

  // NEW: quick access tenant swipe dialog for owners
  const [showOwnerSwipe, setShowOwnerSwipe] = useState(false)

  // Legal documents dialog
  const [showLegalDocuments, setShowLegalDocuments] = useState(false)

  // Support dialog
  const [showSupport, setShowSupport] = useState(false)

  // Filters dialog
  const [showFilters, setShowFilters] = useState(false)

  // Notifications dialog
  const [showNotifications, setShowNotifications] = useState(false)

  // Category and mode state for filters
  const [filterCategory, setFilterCategory] = useState<'property' | 'yacht' | 'motorcycle' | 'bicycle'>('property');
  const [filterMode, setFilterMode] = useState<'sale' | 'rent' | 'both'>('rent');

  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  // Profile photo state
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)

  // Get listings and profiles data for insights with error handling
  const { data: listings = [], error: listingsError } = useListings();
  const { data: profiles = [], error: profilesError } = useClientProfiles();

  if (listingsError) {
    console.error('DashboardLayout - Listings error:', listingsError);
  }
  if (profilesError) {
    console.error('DashboardLayout - Profiles error:', profilesError);
  }

  // Auto-open property form when the URL hash matches any category
  useEffect(() => {
    const hash = location.hash;
    const categoryMap: Record<string, string> = {
      '#add-property': 'property',
      '#add-yacht': 'yacht',
      '#add-motorcycle': 'motorcycle',
      '#add-bicycle': 'bicycle',
    };

    if (hash && categoryMap[hash]) {
      // Check if there's an editing property in sessionStorage
      const storedEditingProperty = sessionStorage.getItem('editingProperty');
      if (storedEditingProperty) {
        try {
          const property = JSON.parse(storedEditingProperty);
          setEditingProperty(property);
          // Clear from sessionStorage after using
          sessionStorage.removeItem('editingProperty');
        } catch (error) {
          console.error('Error parsing stored editing property:', error);
        }
      } else {
        setEditingProperty(null);
      }
      
      // Set category from hash
      const category = categoryMap[hash] as 'property' | 'yacht' | 'motorcycle' | 'bicycle';
      setFilterCategory(category);
      setShowPropertyForm(true);
    } else if (!hash) {
      setShowPropertyForm(false);
      setEditingProperty(null);
    }
  }, [location.hash])

  // Remove auto-opening tenant swipe on /owner/properties - this was causing the wrong interface to show
  // useEffect(() => {
  //   if (userRole === 'owner' && location.pathname === '/owner/properties') {
  //     setShowOwnerSwipe(true)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [userRole, location.pathname])

  const selectedListing = selectedListingId ? listings.find(l => l.id === selectedListingId) : null;
  const selectedProfile = selectedProfileId ? profiles.find(p => p.user_id === selectedProfileId) : null;

  const handleMenuItemClick = (item: string) => {
    
    switch (item) {
      case 'add-listing':
        // This will be handled by the CategorySelectionDialog in OwnerDashboard
        break
      case 'add-property':
        setShowPropertyForm(true)
        break
      case 'filters':
        // Handle filters for client - navigate to dashboard if not already there
        if (userRole === 'client' && location.pathname !== '/client/dashboard') {
          navigate('/client/dashboard');
        } else if (userRole === 'owner' && location.pathname !== '/owner/dashboard') {
          navigate('/owner/dashboard');
        }
        // The filters will be handled by the dashboard page itself
        break
      case 'upgrade':
        setSubscriptionReason('Choose the perfect plan for your needs!')
        setShowSubscriptionPackages(true)
        break
      case 'premium-packages':
        setSubscriptionReason('Choose the perfect plan for your needs!')
        setShowSubscriptionPackages(true)
        break
      case 'liked-properties':
        setShowLikedProperties(true)
        break
      case 'preferences':
        setShowPreferences(true)
        break
      case 'profile':
        if (userRole === 'owner') {
          setShowOwnerProfile(true)
        } else {
          setShowProfile(true)
        }
        break
      case 'messages':
        navigate('/messages')
        break
      case 'legal-documents':
        setShowLegalDocuments(true)
        break
      case 'support':
        setShowSupport(true)
        break
      case 'notifications':
        setShowNotifications(true)
        break
      case 'settings':
        if (userRole === 'owner') {
          setShowOwnerSettings(true)
        } else {
          toast({
            title: 'Settings',
            description: 'Settings page coming soon! This will include your statistics and preferences.',
          })
        }
        break
      case 'dashboard':
      default:
        break
    }
  }

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

  const InsetComponent: any = (SidebarInset as any) || ((props: any) => <div {...props} />)
  const TriggerComponent: any = (SidebarTrigger as any) || ((props: any) => <button {...props} />)

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 relative">
        <NotificationSystem />
        <AppSidebar userRole={userRole} onMenuItemClick={handleMenuItemClick} />
        
        <InsetComponent className="flex-1 flex flex-col min-h-screen w-full">
          {/* Header with trigger - same gradient for both roles */}
          <header className="flex h-12 shrink-0 items-center gap-2 px-3 shadow-lg border-b sticky top-0 z-50 bg-gradient-to-r from-primary to-secondary">
            <TriggerComponent className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200 flex-shrink-0" />
              
              {/* Brand Header with Profile Photo - only show for client */}
              {userRole === 'client' && (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Profile Photo - only in header when sidebar is closed */}
                  <ProfilePhotoUpload
                    currentPhotoUrl={profilePhotoUrl}
                    size="sm"
                    onPhotoUpdate={setProfilePhotoUrl}
                    className="flex-shrink-0"
                  />
                  
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-md flex-shrink-0 bg-white/20">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-white font-bold text-sm leading-tight truncate">TINDERENT</h1>
                  </div>
                </div>
              )}
            </header>

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-orange-500 via-red-500 to-pink-500">
            <div className="w-full min-h-full relative">
              {
                React.Children.map(children, (child) => {
                  if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement, {
                      onPropertyInsights: handlePropertyInsights,
                      onClientInsights: handleClientInsights,
                      onMessageClick: handleMessageClick,
                    } as any);
                  }
                  return child;
                })
              }
            </div>
          </main>
        </InsetComponent>
      </div>

      {/* Modals */}
      {userRole === 'owner' && showPropertyForm && (
        <PropertyForm
          isOpen={showPropertyForm}
          onClose={() => {
            setShowPropertyForm(false);
            setEditingProperty(null);
            // Clear hash when closing form
            window.history.replaceState(null, '', window.location.pathname);
          }}
          editingProperty={editingProperty}
          initialCategory={filterCategory}
          initialMode={filterMode}
        />
      )}

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

      {userRole === 'client' && (
        <CategoryFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onApplyFilters={(filters) => {
            console.log('Applied filters:', filters);
            // TODO: Apply filters to listings
          }}
        />
      )}
    </SidebarProvider>
  )
}
