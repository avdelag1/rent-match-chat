import { Home, Users, MessageSquare, Settings, User, LogOut, Building2, Flame, PlusCircle, Crown, FileText, HelpCircle, Filter, Bell, Bookmark } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload"
import { ThemeSelector } from "@/components/ThemeSelector"
import { NotificationBadge } from "@/components/NotificationBadge"
import { Badge } from "@/components/ui/badge"
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount"
import { useUnreadLikes } from "@/hooks/useUnreadLikes"
import { useUnreadMatches } from "@/hooks/useUnreadMatches"
import { useSavedFilters } from "@/hooks/useSavedFilters"
import { useState } from "react"

// Menu items for different user types
const clientMenuItems = [
  {
    title: "Dashboard",
    url: "/client/dashboard",
    icon: Home,
  },
  {
    title: "Filters",
    url: "#filters",
    icon: Filter,
    action: 'filters'
  },
  {
    title: "Saved Searches",
    url: "#saved-searches",
    icon: Bookmark,
    action: 'saved-searches'
  },
  {
    title: "Notifications",
    url: "#notifications",
    icon: Bell,
    action: 'notifications'
  },
  {
    title: "Liked Properties",
    url: "/client/liked-properties",
    icon: Flame,
  },
  {
    title: "Contracts",
    url: "/client/contracts",
    icon: FileText,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    url: "/client/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/client/settings",
    icon: Settings,
  },
  {
    title: "Premium Packages",
    url: "#premium-packages",
    icon: Crown,
    action: 'premium-packages'
  },
  {
    title: "Support",
    url: "#support",
    icon: HelpCircle,
    action: 'support'
  },
]

const ownerMenuItems = [
  {
    title: "Dashboard",
    url: "/owner/dashboard",
    icon: Home,
  },
  {
    title: "Notifications",
    url: "#notifications",
    icon: Bell,
    action: 'notifications'
  },
  {
    title: "My Listings",
    url: "/owner/properties",
    icon: Building2,
  },
  {
    title: "Add Listing",
    url: "#add-listing",
    icon: PlusCircle,
    action: "add-listing",
  },
  {
    title: "Liked Clients",
    url: "/owner/liked-clients",
    icon: Flame,
  },
  {
    title: "Contracts",
    url: "/owner/contracts",
    icon: FileText,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    url: "/owner/profile",
    icon: User,
  },
  {
    title: "Legal Documents",
    url: "#legal-documents",
    icon: FileText,
    action: "legal-documents",
  },
  {
    title: "Settings",
    url: "/owner/settings",
    icon: Settings,
  },
  {
    title: "Premium Packages",
    url: "#premium-packages",
    icon: Crown,
    action: 'premium-packages'
  },
  {
    title: "Support",
    url: "#support",
    icon: HelpCircle,
    action: 'support'
  },
]

export interface AppSidebarProps {
  userRole?: 'client' | 'owner';
  onMenuItemClick?: (item: string) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ userRole: propUserRole, onMenuItemClick }) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { setOpenMobile } = useSidebar()
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | undefined>(undefined)
  const { unreadCount } = useUnreadMessageCount()
  const { unreadCount: unreadLikes } = useUnreadLikes()
  const { unreadCount: unreadMatches } = useUnreadMatches()
  const { savedFilters, activeFilter } = useSavedFilters()
  
  // Resolve role safely (prevents TS literal narrowing issues)
  const userRole: 'client' | 'owner' = (propUserRole ?? 'owner')

  const menuItems = userRole === 'client' ? clientMenuItems : ownerMenuItems
  
  // Count active filters - count based on active filter criteria
  const activeFilterCount = activeFilter ? (
    (activeFilter.listing_types?.length || 0) +
    (activeFilter.client_types?.length || 0) +
    (activeFilter.lifestyle_tags?.length || 0) +
    (activeFilter.preferred_occupations?.length || 0) +
    (activeFilter.min_budget || activeFilter.max_budget ? 1 : 0) +
    (activeFilter.min_age || activeFilter.max_age ? 1 : 0)
  ) : 0;

  const isActive = (url: string) => {
    if (url === "#add-property") return false
    return location.pathname === url || location.pathname.startsWith(url)
  }

  const handleMenuClick = (item: any) => {
    if (item.action === 'add-listing') {
      // Close sidebar first on mobile, then open category dialog
      setOpenMobile(false)
      setTimeout(() => {
        if (onMenuItemClick) onMenuItemClick('add-listing')
      }, 150)
    } else if (item.action === 'add-property') {
      // Use URL hash so DashboardLayout can auto-open the form
      if (location.hash !== '#add-property') {
        location.hash = '#add-property'
      }
      if (onMenuItemClick) onMenuItemClick('add-property')
    } else if (item.action === 'premium-packages') {
      // Open premium packages dialog directly
      if (onMenuItemClick) onMenuItemClick('premium-packages')
    } else if (item.action === 'legal-documents') {
      // Open legal documents dialog
      if (onMenuItemClick) onMenuItemClick('legal-documents')
    } else if (item.action === 'support') {
      // Open support dialog
      if (onMenuItemClick) onMenuItemClick('support')
    } else if (item.action === 'filters') {
      // Close sidebar first on mobile, then open filters
      console.log('🎛️ Closing sidebar, opening filters...')
      setOpenMobile(false)
      setTimeout(() => {
        if (onMenuItemClick) onMenuItemClick('filters')
      }, 150)
    } else if (item.action === 'notifications') {
      // Open notifications dialog
      if (onMenuItemClick) onMenuItemClick('notifications')
    } else if (item.action === 'saved-searches') {
      // Open saved searches dialog
      if (onMenuItemClick) onMenuItemClick('saved-searches')
    } else {
      navigate(item.url)
      if (onMenuItemClick) onMenuItemClick('dashboard')
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <Sidebar className="border-none">
      <div className="h-full bg-background shadow-xl border-r border-border flex flex-col">
        {/* Sidebar Header with Large Profile Photo */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex flex-col items-center gap-3 text-center">
            {/* Large clickable profile photo */}
            <ProfilePhotoUpload
              currentPhotoUrl={profilePhotoUrl}
              size="lg"
              onPhotoUpdate={setProfilePhotoUrl}
            />
            
            <div>
              <h2 className="text-foreground font-bold text-lg">
                TINDE<span className="text-red-500">R</span>ENT
              </h2>
              <p className="text-muted-foreground text-xs font-medium">
                {userRole === 'client' ? 'Client Portal' : 'Owner Portal'}
              </p>
            </div>
          </div>
        </div>

        <SidebarContent className="p-3 flex-1 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel className="text-foreground font-medium mb-3 px-2">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                          onClick={() => handleMenuClick(item)}
                          className={`
                            w-full rounded-lg p-2.5 transition-all duration-200 group border relative
                            ${isActive(item.url) 
                              ? 'text-primary-foreground shadow-md border-primary/30 bg-primary' 
                              : 'bg-secondary hover:bg-secondary/80 text-foreground border-border hover:border-border'
                            }
                          `}
                        >
                          <item.icon className={`w-5 h-5 ${isActive(item.url) ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                          <span className={`font-medium ml-3 ${isActive(item.url) ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {item.title}
                          </span>
                          {item.title === 'Filters' && activeFilterCount > 0 && (
                            <Badge variant="default" className="ml-auto px-2 py-0.5 text-xs">
                              {activeFilterCount}
                            </Badge>
                          )}
                          {item.title === 'Messages' && unreadCount > 0 && (
                            <NotificationBadge count={unreadCount} className="ml-auto" />
                          )}
                          {item.title === 'Liked Properties' && unreadLikes > 0 && (
                            <NotificationBadge count={unreadLikes} className="ml-auto" />
                          )}
                          {item.title === 'Liked Clients' && unreadLikes > 0 && (
                            <NotificationBadge count={unreadLikes} className="ml-auto" />
                          )}
                          {item.title === 'Match History' && unreadMatches > 0 && (
                            <NotificationBadge count={unreadMatches} className="ml-auto" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  </motion.div>
                ))}
                
                 {/* Sign Out Button */}
                 <motion.div
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: menuItems.length * 0.1 }}
                 >
                   <SidebarMenuItem className="mt-4">
                      <SidebarMenuButton 
                        onClick={handleSignOut}
                        className="w-full rounded-lg p-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 hover:border-destructive/50 transition-all duration-200"
                      >
                       <LogOut className="w-5 h-5 text-destructive" />
                       <span className="font-medium text-destructive ml-3">Sign Out</span>
                     </SidebarMenuButton>
                   </SidebarMenuItem>
                </motion.div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* User Info Card */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-3 bg-secondary rounded-lg border border-border flex-shrink-0"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-foreground font-medium text-sm">Welcome back!</p>
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                </div>
              </div>
              
              {/* Quick Theme Switcher */}
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">Quick Theme</p>
                <ThemeSelector compact showTitle={false} />
              </div>
            </motion.div>
          )}
        </SidebarContent>
      </div>
    </Sidebar>
  )
}

export default AppSidebar
export { AppSidebar }