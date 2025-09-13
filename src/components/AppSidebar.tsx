import { Home, Users, MessageSquare, Settings, User, LogOut, Building2, Heart, PlusCircle, Crown, Flame } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"

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
    icon: Heart,
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
    title: "Subscription",
    url: "/client/settings#subscription",
    icon: Crown,
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
    title: "Settings",
    url: "/owner/settings",
    icon: Settings,
  },
  {
    title: "Subscription",
    url: "/owner/settings#subscription",
    icon: Crown,
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
      <div className="h-full" style={{ background: 'var(--app-gradient)' }}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/40">
              <Flame className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg drop-shadow-sm">TINDERENT</h2>
              <p className="text-white/80 text-xs font-medium">
                {userRole === 'client' ? 'Client Portal' : 'Owner Portal'}
              </p>
            </div>
          </div>
        </div>

        <SidebarContent className="p-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-white/90 font-medium mb-4 px-3 drop-shadow-sm">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
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
                          w-full rounded-xl p-3 transition-all duration-200 group border
                          ${isActive(item.url) 
                            ? 'bg-white/95 text-gray-900 shadow-lg backdrop-blur-sm border-white/50' 
                            : 'bg-white/15 hover:bg-white/25 text-white border-white/30 hover:border-white/40'
                          }
                        `}
                        style={isActive(item.url) ? { boxShadow: 'var(--shadow-md)' } : {}}
                      >
                        <item.icon className={`w-5 h-5 ${isActive(item.url) ? 'text-gray-700' : 'text-white drop-shadow-sm'}`} />
                        <span className={`font-medium ${isActive(item.url) ? 'text-gray-900' : 'text-white drop-shadow-sm'}`}>
                          {item.title}
                        </span>
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
                  <SidebarMenuItem className="mt-6">
                    <SidebarMenuButton 
                      onClick={handleSignOut}
                      className="w-full rounded-xl p-3 bg-red-500/25 hover:bg-red-500/35 text-white border border-red-400/40 hover:border-red-400/60 transition-all duration-200"
                    >
                      <LogOut className="w-5 h-5 text-red-200 drop-shadow-sm" />
                      <span className="font-medium text-red-100 drop-shadow-sm">Sign Out</span>
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
              className="mt-8 p-4 bg-white/15 backdrop-blur-md rounded-xl border border-white/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center border border-white/30">
                  <User className="w-5 h-5 text-white drop-shadow-sm" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm drop-shadow-sm">Welcome back!</p>
                  <p className="text-white/80 text-xs">{user.email}</p>
                </div>
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