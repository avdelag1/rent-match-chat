
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
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => handleMenuClick(item)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut />
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
