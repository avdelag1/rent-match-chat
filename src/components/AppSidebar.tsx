import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  Heart, 
  MessageCircle, 
  User, 
  Settings,
  Building,
  Users,
  BarChart3,
  FileText,
  Shield
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

// Define navigation items for different user roles
const clientItems = [
  { title: "Dashboard", url: "/client/dashboard", icon: Home },
  { title: "Liked Properties", url: "/client/liked-properties", icon: Heart },
  { title: "Match History", url: "/client/match-history", icon: BarChart3 },
  { title: "Messages", url: "/messaging", icon: MessageCircle },
  { title: "Profile", url: "/client/profile", icon: User },
  { title: "Settings", url: "/client/settings", icon: Settings },
];

const ownerItems = [
  { title: "Dashboard", url: "/owner/dashboard", icon: Home },
  { title: "Properties", url: "/owner/properties", icon: Building },
  { title: "Liked Clients", url: "/owner/liked-clients", icon: Users },
  { title: "Match History", url: "/owner/match-history", icon: BarChart3 },
  { title: "Messages", url: "/messaging", icon: MessageCircle },
  { title: "Profile", url: "/owner/profile", icon: User },
  { title: "Settings", url: "/owner/settings", icon: Settings },
];

interface AppSidebarProps {
  userRole?: 'client' | 'owner';
}

export default function AppSidebar({ userRole = 'client' }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const items = userRole === 'owner' ? ownerItems : clientItems;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-white/20 text-white font-bold border-r-4 border-white" 
      : "hover:bg-white/10 text-white/90 hover:text-white";

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} bg-gradient-to-b from-orange-400 to-red-500 border-r border-white/20 transition-all duration-300`}
      collapsible="icon"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/20 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-lg text-white">
              Tinderents
            </span>
          </div>
        )}
        <SidebarTrigger className="hover:bg-white/10 text-white rounded-md p-1" />
      </div>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : "text-white/70 font-semibold"}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200
                        ${getNavCls({ isActive })}
                      `}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Actions */}
        {!collapsed && (
          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className="text-white/70 font-semibold">Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`/${userRole}/security`}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200
                        ${getNavCls({ isActive })}
                      `}
                    >
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Security</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}