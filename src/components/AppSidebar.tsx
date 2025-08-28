
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useUserSubscription } from "@/hooks/useSubscription"
import { Heart, MessageCircle, Settings, User, CreditCard, Plus, Home, LogOut, Menu } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  key: string
  premium?: boolean
}

interface AppSidebarProps {
  userRole: 'client' | 'owner'
  onMenuItemClick: (item: string) => void
}

export function AppSidebar({ userRole, onMenuItemClick }: AppSidebarProps) {
  const { user, signOut } = useAuth()
  const { data: subscription } = useUserSubscription()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const clientMenuItems: MenuItem[] = [
    { 
      title: "Dashboard", 
      icon: Home, 
      key: "dashboard" 
    },
    { 
      title: "Messages", 
      icon: MessageCircle, 
      key: "messages",
      premium: true 
    },
    { 
      title: "Liked Properties", 
      icon: Heart, 
      key: "liked-properties" 
    },
    { 
      title: "Preferences", 
      icon: Settings, 
      key: "preferences" 
    },
    { 
      title: "Profile", 
      icon: User, 
      key: "profile" 
    }
  ]

  const ownerMenuItems: MenuItem[] = [
    { 
      title: "Dashboard", 
      icon: Home, 
      key: "dashboard" 
    },
    { 
      title: "Add Property", 
      icon: Plus, 
      key: "add-property" 
    },
    { 
      title: "Messages", 
      icon: MessageCircle, 
      key: "messages" 
    },
    { 
      title: "Settings", 
      icon: Settings, 
      key: "settings" 
    },
    { 
      title: "Profile", 
      icon: User, 
      key: "profile" 
    }
  ]

  const menuItems = userRole === 'client' ? clientMenuItems : ownerMenuItems

  const handleMenuClick = (key: string) => {
    onMenuItemClick(key)
  }

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-white">Tinderent</h2>
              <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70">
            {!isCollapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton 
                    onClick={() => handleMenuClick(item.key)}
                    className="text-white hover:bg-white/10 data-[active=true]:bg-white/20"
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className="w-4 h-4" />
                    {!isCollapsed && (
                      <span className="flex items-center gap-2">
                        {item.title}
                        {item.premium && !subscription && (
                          <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
                            Pro
                          </Badge>
                        )}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Subscription Section */}
        {userRole === 'client' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-white/70">
              {!isCollapsed && "Subscription"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  {subscription ? (
                    <div className={`p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 ${isCollapsed ? 'text-center' : ''}`}>
                      {!isCollapsed ? (
                        <>
                          <p className="text-green-400 text-xs font-medium">Active Plan</p>
                          <p className="text-white text-sm">{subscription.subscription_packages?.name}</p>
                        </>
                      ) : (
                        <div className="w-2 h-2 bg-green-400 rounded-full mx-auto" />
                      )}
                    </div>
                  ) : (
                    <SidebarMenuButton 
                      onClick={() => handleMenuClick('upgrade')}
                      className="text-white hover:bg-white/10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30"
                      tooltip={isCollapsed ? "Upgrade to Premium" : undefined}
                    >
                      <CreditCard className="w-4 h-4" />
                      {!isCollapsed && "Upgrade to Premium"}
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={signOut}
              className="text-white hover:bg-red-500/20 border border-red-400/30"
              tooltip={isCollapsed ? "Sign Out" : undefined}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && "Sign Out"}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {!isCollapsed && (
          <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/80 text-xs font-medium">{user?.email}</p>
            <p className="text-white/60 text-xs">{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
