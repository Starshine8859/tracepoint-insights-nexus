
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";

const DashboardLayout = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  const showNotification = () => {
    toast({
      title: "Notifications",
      description: "You have no new notifications at this time.",
    });
  };
  
  return (
    <div className="flex h-screen w-full bg-background dark:bg-background">
      <AppSidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                TracePoint Analytics
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
                {currentDate.toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              <ThemeToggle />
              
              {/* <Button variant="ghost" size="icon" onClick={showNotification}>
                <Bell className="h-5 w-5" />
              </Button>
              
              <AuthButton />
              
              <Button variant="ghost" size="icon" asChild>
                <a href="/settings">
                  <Settings className="h-5 w-5" />
                </a>
              </Button> */}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in">
          <Outlet />
        </main>
        
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>TracePoint Analytics | Telemetry Collection and Monitoring System</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
