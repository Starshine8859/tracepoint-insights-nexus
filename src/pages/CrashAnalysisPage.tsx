
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Filter,
  Eye,
  Download,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_DEVICES, MOCK_TRENDS } from "@/lib/mock-data";

const COLORS = ["#EF4444", "#F59E0B", "#8B5CF6", "#3B82F6"];

// Helper function to extract crash data from devices
const extractCrashData = (devices: any[]) => {
  const crashSources: Record<string, number> = {};
  const crashDevices: Record<string, any[]> = {};
  const crashEvents: any[] = [];
  
  // Create synthetic crashes based on the device data
  devices.forEach(device => {
    if (device.crashCount > 0) {
      // Generate random crash sources
      const sources = [
        "Application Error",
        "Windows Error Reporting",
        "Service Control Manager",
        ".NET Runtime",
        "Application Hang",
        "BugCheck"
      ];
      
      const messages = [
        "Faulting module: example.exe",
        "The application stopped responding",
        "Access violation in module ntdll.dll",
        "The process terminated unexpectedly",
        "Unhandled exception in kernel32.dll",
        "Failed with HRESULT: 0x8007FFFF"
      ];
      
      // Create crash events based on the device's crash count
      for (let i = 0; i < device.crashCount; i++) {
        const source = sources[Math.floor(Math.random() * sources.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        const eventId = 1000 + Math.floor(Math.random() * 100);
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        // Count crash sources
        crashSources[source] = (crashSources[source] || 0) + 1;
        
        // Track devices with this crash source
        if (!crashDevices[source]) {
          crashDevices[source] = [];
        }
        if (!crashDevices[source].includes(device.computerName)) {
          crashDevices[source].push(device.computerName);
        }
        
        // Add to crash events
        crashEvents.push({
          deviceId: device.deviceId,
          deviceName: device.computerName,
          user: device.loggedOnUser,
          source,
          message,
          eventId,
          timestamp: date.toISOString(),
          formattedDate: date.toLocaleDateString(),
          formattedTime: date.toLocaleTimeString(),
        });
      }
    }
  });
  
  // Convert crash sources to an array for charts
  const crashSourcesArray = Object.keys(crashSources).map(source => ({
    name: source,
    value: crashSources[source],
    devices: crashDevices[source].length,
  }));
  
  return { crashSourcesArray, crashEvents };
};

const CrashAnalysisPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("30");
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState("");
  
  // Extract crash data from our mock devices
  const { crashSourcesArray, crashEvents } = useMemo(
    () => extractCrashData(MOCK_DEVICES),
    [MOCK_DEVICES]
  );
  
  // Filter and sort crash events
  const filteredCrashEvents = useMemo(() => {
    let filtered = [...crashEvents];
    
    // Apply search filter
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.deviceName.toLowerCase().includes(lowerFilter) ||
          event.user.toLowerCase().includes(lowerFilter) ||
          event.source.toLowerCase().includes(lowerFilter) ||
          event.message.toLowerCase().includes(lowerFilter)
      );
    }
    
    // Apply time range filter
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));
    filtered = filtered.filter(
      event => new Date(event.timestamp) > cutoffDate
    );
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valA, valB;
      
      if (sortField === "timestamp") {
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }
      
      if (sortDirection === "asc") {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
    
    return filtered;
  }, [crashEvents, filter, timeRange, sortField, sortDirection]);
  
  // Crash trends over time
  const crashTrends = useMemo(() => {
    return MOCK_TRENDS.slice(-parseInt(timeRange)).map(day => ({
      date: day.date,
      crashes: day.crashCount,
    }));
  }, [MOCK_TRENDS, timeRange]);
  
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };
  
  const getDeviceUrl = (deviceId: string) => `/devices/${deviceId}`;
  
  const totalCrashes = filteredCrashEvents.length;
  const affectedDevices = new Set(filteredCrashEvents.map(e => e.deviceId)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <h1 className="text-2xl font-semibold">Crash Analysis</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="Crash Summary" description="By error source">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={crashSourcesArray}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {crashSourcesArray.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} crashes, ${props.payload.devices} devices`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total crashes: <span className="font-medium text-red-500">{totalCrashes}</span> across{" "}
              <span className="font-medium">{affectedDevices}</span> devices
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Crash Trends" description={`Last ${timeRange} days`}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={crashTrends}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} crashes`, "Count"]} />
                <Bar dataKey="crashes" name="Crashes" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold">Crash Events</h2>
            
            <div className="relative w-full sm:w-64 md:w-80">
              <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Filter crash events..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort("deviceName")}
                >
                  <div className="flex items-center">
                    Device
                    {sortField === "deviceName" && (
                      sortDirection === "asc" ? 
                        <ArrowUp className="ml-1 h-3 w-3" /> : 
                        <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort("source")}
                >
                  <div className="flex items-center">
                    Source
                    {sortField === "source" && (
                      sortDirection === "asc" ? 
                        <ArrowUp className="ml-1 h-3 w-3" /> : 
                        <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="hidden md:table-cell cursor-pointer"
                  onClick={() => toggleSort("eventId")}
                >
                  <div className="flex items-center">
                    Event ID
                    {sortField === "eventId" && (
                      sortDirection === "asc" ? 
                        <ArrowUp className="ml-1 h-3 w-3" /> : 
                        <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="hidden lg:table-cell cursor-pointer"
                  onClick={() => toggleSort("timestamp")}
                >
                  <div className="flex items-center">
                    Timestamp
                    {sortField === "timestamp" && (
                      sortDirection === "asc" ? 
                        <ArrowUp className="ml-1 h-3 w-3" /> : 
                        <ArrowDown className="ml-1 h-3 w-3" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="hidden lg:table-cell">Message</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCrashEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No crash events found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCrashEvents.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="font-medium">{event.deviceName}</div>
                      <div className="text-xs text-muted-foreground">{event.user}</div>
                    </TableCell>
                    <TableCell>
                      {event.source}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{event.eventId}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">
                      <div>{event.formattedDate}</div>
                      <div className="text-xs text-muted-foreground">{event.formattedTime}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[300px] truncate">
                      {event.message}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(getDeviceUrl(event.deviceId))}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CrashAnalysisPage;
