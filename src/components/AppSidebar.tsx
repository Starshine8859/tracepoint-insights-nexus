
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart,
  Cpu,
  Database,
  HardDrive,
  Home,
  Settings,
  TrendingUp,
  User,
  Shield,
  AlertTriangle
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
  useSidebar
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => currentPath === path;
  
  const getNavClass = ({ isActive }: { isActive: boolean }) => 
    isActive 
      ? "bg-primary-100 text-primary-700 font-medium" 
      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800";
  
  return (
    <Sidebar
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-width duration-300 ${
        isCollapsed ? "w-[70px]" : "w-[240px]"
      }`}
    >
      <div className="p-4 flex justify-center items-center">
        {!isCollapsed && (
          <div className="flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">TracePoint</span>
          </div>
        )}
        {isCollapsed && <Shield className="h-8 w-8 text-primary" />}
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Main
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" className={getNavClass} end>
                    <Home className="mr-2 h-5 w-5" />
                    {!isCollapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/devices" className={getNavClass}>
                    <HardDrive className="mr-2 h-5 w-5" />
                    {!isCollapsed && <span>Devices</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/trends" className={getNavClass}>
                    <TrendingUp className="mr-2 h-5 w-5" />
                    {!isCollapsed && <span>Trends</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/crashes" className={getNavClass}>
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    {!isCollapsed && <span>Crash Analysis</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Configuration
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavClass}>
                    <Settings className="mr-2 h-5 w-5" />
                    {!isCollapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
