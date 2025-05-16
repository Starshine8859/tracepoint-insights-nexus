
import { useState, useMemo } from "react";
import { 
  HardDrive, Search, AlertTriangle, 
  CircleCheck, CircleAlert, CircleX 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DevicesTable from "@/components/Dashboard/DevicesTable";
import { MOCK_DEVICES } from "@/lib/mock-data";

const DevicesPage = () => {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const devices = MOCK_DEVICES;
  
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      // Filter by search term
      const searchMatch =
        device.computerName.toLowerCase().includes(search.toLowerCase()) ||
        device.loggedOnUser.toLowerCase().includes(search.toLowerCase()) ||
        device.deviceId.toLowerCase().includes(search.toLowerCase());
      
      // Filter by tab
      if (selectedTab === "all") return searchMatch;
      if (selectedTab === "online") return searchMatch && device.status === "online";
      if (selectedTab === "warning") return searchMatch && device.status === "warning";
      if (selectedTab === "error") return searchMatch && device.status === "error";
      if (selectedTab === "offline") return searchMatch && device.status === "offline";
      
      return searchMatch;
    });
  }, [devices, search, selectedTab]);
  
  // Count devices by status
  const onlineCount = devices.filter((d) => d.status === "online").length;
  const warningCount = devices.filter((d) => d.status === "warning").length;
  const errorCount = devices.filter((d) => d.status === "error").length;
  const offlineCount = devices.filter((d) => d.status === "offline").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <HardDrive className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Devices</h1>
        </div>
        
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="all" className="flex gap-2">
            All
            <Badge variant="secondary">{devices.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="online" className="flex gap-2">
            <CircleCheck className="h-4 w-4 text-green-500" />
            Online
            <Badge variant="secondary">{onlineCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="warning" className="flex gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Warning
            <Badge variant="secondary">{warningCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="error" className="flex gap-2">
            <CircleAlert className="h-4 w-4 text-red-500" />
            Error
            <Badge variant="secondary">{errorCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="offline" className="flex gap-2">
            <CircleX className="h-4 w-4 text-gray-500" />
            Offline
            <Badge variant="secondary">{offlineCount}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <DevicesTable devices={filteredDevices} />
        </TabsContent>
        <TabsContent value="online">
          <DevicesTable devices={filteredDevices} />
        </TabsContent>
        <TabsContent value="warning">
          <DevicesTable devices={filteredDevices} />
        </TabsContent>
        <TabsContent value="error">
          <DevicesTable devices={filteredDevices} />
        </TabsContent>
        <TabsContent value="offline">
          <DevicesTable devices={filteredDevices} />
        </TabsContent>
      </Tabs>
      
      {filteredDevices.length === 0 && search && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No devices found matching '{search}'
          </p>
          <Button 
            variant="ghost" 
            onClick={() => setSearch("")} 
            className="mt-2"
          >
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
