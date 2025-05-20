
// Update the isCollapsed to collapsed to match the SidebarContext type
import { NavLink } from "react-router-dom";
import {
  CircleAlert,
  Computer,
  LineChart,
  SettingsIcon,
  LayoutDashboard,
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

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Devices", href: "/devices", icon: Computer },
  // { name: "Trends", href: "/trends", icon: LineChart },
  // { name: "Crashes", href: "/crashes", icon: CircleAlert },
  // { name: "Settings", href: "/settings", icon: SettingsIcon },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className={`border-r border-border ${
        collapsed ? "w-[70px]" : "w-64"
      } transition-all duration-300 ease-in-out`}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />
      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                      }`
                    }
                    end={item.href === "/"}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
