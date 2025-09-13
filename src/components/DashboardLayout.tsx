
import React, { ReactNode, useState, useEffect } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Flame } from 'lucide-react'
import AppSidebar from "@/components/AppSidebar"
import { PropertyForm } from "@/components/PropertyForm"
import { SubscriptionPackages } from "@/components/SubscriptionPackages"
import { LikedPropertiesDialog } from "@/components/LikedPropertiesDialog"
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
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: ReactNode
  userRole: 'client' | 'owner'
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [showPropertyForm, setShowPropertyForm] = useState(false)
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

  const navigate = useNavigate()
  const location = useLocation()

  // Get listings and profiles data for insights with error handling
  const { data: listings = [], error: listingsError } = useListings();
  const { data: profiles = [], error: profilesError } = useClientProfiles();

  if (listingsError) {
    console.error('DashboardLayout - Listings error:', listingsError);
  }
  if (profilesError) {
    console.error('DashboardLayout - Profiles error:', profilesError);
  }

  // Auto-open property form when the URL hash is "#add-property"
  useEffect(() => {
    if (location.hash === '#add-property') {
      setShowPropertyForm(true)
    }
  }, [location.hash])

  // Auto-open tenant swipe on /owner/properties so owners see cards immediately
  useEffect(() => {
    if (userRole === 'owner' && location.pathname === '/owner/properties') {
      setShowOwnerSwipe(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, location.pathname])

  const selectedListing = selectedListingId ? listings.find(l => l.id === selectedListingId) : null;
  const selectedProfile = selectedProfileId ? profiles.find(p => p.user_id === selectedProfileId) : null;

  const handleMenuItemClick = (item: string) => {
    console.log('Dashboard menu item clicked:', item);
    
    switch (item) {
      case 'add-property':
        setShowPropertyForm(true)
        break
      case 'upgrade':
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
    const roleText = userRole === 'owner' ? 'tenants' : 'owners'
    setSubscriptionReason(`Unlock messaging to connect with ${roleText}!`)
    setShowSubscriptionPackages(true)
  }

  const handlePropertyInsights = (listingId: string) => {
    setSelectedListingId(listingId)
    setShowPropertyInsights(true)
  }

  const handleClientInsights = (profileId: string) => {
    console.log('Opening client insights for:', profileId);
    setSelectedProfileId(profileId)
    setShowClientInsights(true)
  }

  const InsetComponent: any = (SidebarInset as any) || ((props: any) => <div {...props} />)
  const TriggerComponent: any = (SidebarTrigger as any) || ((props: any) => <button {...props} />)

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ background: 'var(--app-gradient)' }}>
        <AppSidebar userRole={userRole} onMenuItemClick={handleMenuItemClick} />
        
        <InsetComponent className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/20 bg-white/15 backdrop-blur-md px-6">
            <TriggerComponent className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200" />
            
            {/* Brand Header */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Flame className="w-4 h-4 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg drop-shadow-sm">TINDERENT</h1>
                <p className="text-white/80 text-xs font-medium">
                  {userRole === 'owner' ? 'Owner Dashboard' : 'Client Dashboard'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {userRole === 'owner' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/15 border-white/30 text-white hover:bg-white/25 rounded-xl px-4 font-medium backdrop-blur-sm"
                  onClick={() => setShowOwnerSwipe(true)}
                >
                  Find Tenants
                </Button>
              )}
              <div className="bg-white/15 rounded-xl px-4 py-2 backdrop-blur-sm border border-white/20">
                <span className="text-white text-sm font-medium drop-shadow-sm">
                  Welcome back! 
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
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
          </main>
        </InsetComponent>
      </div>

      {/* Modals */}
      {userRole === 'owner' && (
        <PropertyForm
          isOpen={showPropertyForm}
          onClose={() => setShowPropertyForm(false)}
          editingProperty={null}
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
        </>
      )}
    </SidebarProvider>
  )
}
