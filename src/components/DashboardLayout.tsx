
import { ReactNode, useState } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { PropertyForm } from "@/components/PropertyForm"
import { SubscriptionPackages } from "@/components/SubscriptionPackages"
import { LikedPropertiesDialog } from "@/components/LikedPropertiesDialog"
import { ClientPreferencesDialog } from "@/components/ClientPreferencesDialog"
import { ClientProfileDialog } from "@/components/ClientProfileDialog"
import { PropertyDetails } from "@/components/PropertyDetails"
import { toast } from '@/hooks/use-toast'

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
  const [subscriptionReason, setSubscriptionReason] = useState<string>('')

  const handleMenuItemClick = (item: string) => {
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
        setShowProfile(true)
        break
      case 'messages':
        toast({
          title: 'Messages',
          description: 'Message feature coming soon! Upgrade to premium for early access.',
        })
        break
      case 'settings':
        toast({
          title: 'Settings',
          description: 'Settings page coming soon! This will include your statistics and preferences.',
        })
        break
      case 'dashboard':
      default:
        // Already on dashboard
        break
    }
  }

  const handleLikedPropertySelect = (listingId: string) => {
    setSelectedListingId(listingId)
    setShowPropertyDetails(true)
  }

  const handleMessageClick = () => {
    setSubscriptionReason('Unlock messaging to connect with property owners and tenants!')
    setShowSubscriptionPackages(true)
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-primary">
        <AppSidebar userRole={userRole} onMenuItemClick={handleMenuItemClick} />
        
        <SidebarInset className="flex-1">
          {/* Header with trigger */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/20 bg-white/5 backdrop-blur-sm px-4">
            <SidebarTrigger className="text-white hover:bg-white/10" />
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-white text-sm">Welcome back!</span>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
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
        </>
      )}
    </SidebarProvider>
  )
}
