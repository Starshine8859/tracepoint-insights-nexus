
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardLayout from "./layouts/DashboardLayout";
import Index from "./pages/Index";
import DevicesPage from "./pages/DevicesPage";
import DeviceDetailsPage from "./pages/DeviceDetailsPage";
import TrendsPage from "./pages/TrendsPage";
import CrashAnalysisPage from "./pages/CrashAnalysisPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Fixed SidebarProvider by removing defaultCollapsed and using proper props */}
        <SidebarProvider>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Index />} />
              <Route path="devices" element={<DevicesPage />} />
              <Route path="devices/:deviceId" element={<DeviceDetailsPage />} />
              <Route path="trends" element={<TrendsPage />} />
              <Route path="crashes" element={<CrashAnalysisPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
