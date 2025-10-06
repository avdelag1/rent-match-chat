import { Home, Users, MessageSquare, Settings, User, LogOut, Building2, Flame, PlusCircle, Crown, FileText, HelpCircle } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload"
import { ThemeSelector } from "@/components/ThemeSelector"
import { NotificationBadge } from "@/components/NotificationBadge"
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount"
import { useUnreadLikes } from "@/hooks/useUnreadLikes"
import { useUnreadMatches } from "@/hooks/useUnreadMatches"
import { useState } from "react"

// Menu items for different user types
const clientMenuItems = [
  {
    title: "Dashboard",
    url: "/client/dashboard",
    icon: Home,
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
    title: "My Properties",
    url: "/owner/properties",
    icon: Building2,
  },
  {
    title: "Add Property",
    url: "#add-property",
    icon: PlusCircle,
    action: "add-property",
  },
  {
    title: "Client Filters",
    url: "/owner/saved-searches",
    icon: Settings,
  },
  {
    title: "Contracts",
    url: "/owner/contracts",
    icon: FileText,
  },
  {
    title: "Liked Clients",
    url: "/owner/liked-clients",
    icon: Flame,
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
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const { unreadCount } = useUnreadMessageCount()
  const { unreadCount: unreadLikes } = useUnreadLikes()
  const { unreadCount: unreadMatches } = useUnreadMatches()
  
  // Resolve role safely (prevents TS literal narrowing issues)
  const userRole: 'client' | 'owner' = (propUserRole ?? 'owner')

  const menuItems = userRole === 'client' ? clientMenuItems : ownerMenuItems

  const isActive = (url: string) => {
    if (url === "#add-property") return false
    return location.pathname === url || location.pathname.startsWith(url)
  }

  const handleMenuClick = (item: any) => {
    if (item.action === 'add-property') {
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
      <div className="h-full bg-white shadow-xl border-r border-gray-200 flex flex-col">
        {/* Sidebar Header with Large Profile Photo */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-col items-center gap-3 text-center">
            {/* Large clickable profile photo */}
            <ProfilePhotoUpload
              currentPhotoUrl={user?.user_metadata?.profile_photo_url || profilePhotoUrl}
              size="lg"
              onPhotoUpdate={setProfilePhotoUrl}
            />
            
            <div>
              <h2 className="text-gray-900 font-bold text-lg">TINDERENT</h2>
              <p className="text-gray-600 text-xs font-medium">
                {userRole === 'client' ? 'Client Portal' : 'Owner Portal'}
              </p>
            </div>
          </div>
        </div>

        <SidebarContent className="p-3 flex-1 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-700 font-medium mb-3 px-2">
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
                            ? 'text-white shadow-md border-orange-300' 
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
                          }
                        `}
                        style={isActive(item.url) ? { background: 'var(--button-gradient)' } : {}}
                      >
                        <item.icon className={`w-5 h-5 ${isActive(item.url) ? 'text-white' : 'text-gray-600'}`} />
                        <span className={`font-medium ml-3 ${isActive(item.url) ? 'text-white' : 'text-gray-700'}`}>
                          {item.title}
                        </span>
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
                       className="w-full rounded-lg p-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 transition-all duration-200"
                     >
                      <LogOut className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-700 ml-3">Sign Out</span>
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
              className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium text-sm">Welcome back!</p>
                  <p className="text-gray-600 text-xs">{user.email}</p>
                </div>
              </div>
              
              {/* Quick Theme Switcher */}
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-500 mb-2">Quick Theme</p>
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