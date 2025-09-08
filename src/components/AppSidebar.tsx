
import { Home, Users, MessageSquare, Settings, User, LogOut, Building2, Heart, PlusCircle, Crown } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"

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
  
  // Resolve role safely (prevents TS literal narrowing issues)
  const userRole: 'client' | 'owner' = (propUserRole ?? 'owner')

  const menuItems = userRole === 'client' ? clientMenuItems : ownerMenuItems

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
    <Sidebar className="bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 border-r border-white/10">
      <SidebarContent className="bg-transparent">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔥</span>
            <span className="text-xl font-bold text-white tracking-wider">TINDERENT</span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            {userRole === 'owner' ? 'Property Owner' : 'Tenant'}
          </p>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 font-semibold">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleMenuClick(item)}
                    className={`
                      w-full justify-start text-white hover:text-white transition-all duration-300
                      ${index === 0 ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg' : 
                        index === 1 ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg' :
                        index === 2 ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg' :
                        index === 3 ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg' :
                        index === 4 ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg' :
                        index === 5 ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg' :
                        'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg'
                      }
                      rounded-xl p-3 mb-2 hover:scale-105 font-medium
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleSignOut}
                  className="w-full justify-start text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg rounded-xl p-3 hover:scale-105 transition-all duration-300 font-medium mt-4"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
export { AppSidebar }
