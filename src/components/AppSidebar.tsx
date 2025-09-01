
import { Home, Users, MessageSquare, Settings, User, LogOut, Building2, Heart, PlusCircle } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { OwnerSettingsDialog } from "./OwnerSettingsDialog"
import { OwnerProfileDialog } from "./OwnerProfileDialog"

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
    url: "#profile",
    icon: User,
    action: "profile"
  },
  {
    title: "Settings",
    url: "#settings",
    icon: Settings,
    action: "settings"
  },
]

export interface AppSidebarProps {
  userRole?: 'client' | 'owner';
  onMenuItemClick?: (item: string) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ userRole: propUserRole, onMenuItemClick }) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  
  // Resolve role safely (prevents TS literal narrowing issues)
  const userRole: 'client' | 'owner' = (propUserRole ?? 'owner')

  const menuItems = userRole === 'client' ? clientMenuItems : ownerMenuItems

  const handleMenuClick = (item: any) => {
    if (item.action === 'settings') {
      setSettingsOpen(true)
      if (onMenuItemClick) onMenuItemClick('settings')
    } else if (item.action === 'profile') {
      setProfileOpen(true)
      if (onMenuItemClick) onMenuItemClick('profile')
    } else if (item.action === 'add-property') {
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
    <>
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

      {userRole === 'owner' && (
        <>
          <OwnerSettingsDialog 
            open={settingsOpen} 
            onOpenChange={setSettingsOpen} 
          />
          <OwnerProfileDialog 
            open={profileOpen} 
            onOpenChange={setProfileOpen} 
          />
        </>
      )}
    </>
  )
}

export default AppSidebar
export { AppSidebar }
