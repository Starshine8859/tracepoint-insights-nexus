
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Server,
  User,
  Calendar,
  HardDrive,
  Cpu,
  Database,
  AlertTriangle,
  Clock
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import GaugeChart from "@/components/Dashboard/GaugeChart";
import StatusBadge from "@/components/Dashboard/StatusBadge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { format, parseISO, subDays } from "date-fns";
import { MOCK_DEVICES, generateDeviceHistory, TelemetryData } from "@/lib/mock-data";

const DeviceDetailsPage = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<any>(null);
  const [deviceHistory, setDeviceHistory] = useState<TelemetryData[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  
  useEffect(() => {
    if (!deviceId) return;
    
    // Simulate API call to fetch device details
    const fetchDevice = async () => {
      setLoading(true);
      try {
        // Find device in mock data
        const foundDevice = MOCK_DEVICES.find((d) => d.deviceId === deviceId);
        
        if (foundDevice) {
          setDevice(foundDevice);
          
          // Generate historical data for this device
          const history = generateDeviceHistory(
            foundDevice.deviceId,
            foundDevice.computerName,
            30 // Last 30 days
          );
          
          setDeviceHistory(history);
          
          // Format historical data for charts
          const chartData = history.map((item) => ({
            date: format(parseISO(item.timestamp), "MM/dd"),
            cpu: item.performance.cpu,
            ram: item.performance.ram,
            disk: Math.round((item.performance.disk.used / item.performance.disk.total) * 100),
            crashes: item.crashes.length,
            rawDate: item.timestamp,
          }));
          
          setHistoricalData(chartData);
        }
      } catch (error) {
        console.error("Error fetching device details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevice();
  }, [deviceId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading device details...</p>
        </div>
      </div>
    );
  }
  
  if (!device) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-amber-500" />
        <h2 className="text-2xl font-semibold mt-4">Device Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          The device you're looking for doesn't exist or has been removed.
        </p>
        <Button
          className="mt-4"
          onClick={() => navigate("/devices")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Devices
        </Button>
      </div>
    );
  }
  
  const lastSeenDate = parseISO(device.lastSeen);
  
  // Get all crashes from device history
  const allCrashes = deviceHistory.flatMap((item) => 
    item.crashes.map((crash) => ({
      ...crash,
      date: format(parseISO(crash.timestamp), "MMM d, yyyy h:mm a"),
    }))
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/devices")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Devices
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Server className="h-12 w-12 text-primary p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg" />
            <div>
              <h1 className="text-2xl font-semibold">{device.computerName}</h1>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="mr-2">Device ID: {deviceId?.substring(0, 8)}...</span>
                <StatusBadge status={device.status} />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 md:gap-8">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">User</div>
                <div className="font-medium">{device.loggedOnUser}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Last Seen</div>
                <div className="font-medium">{format(lastSeenDate, "MMM d, yyyy")}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Crashes</div>
                <div className="font-medium">
                  {device.crashCount > 0 ? (
                    <span className="text-red-500">{device.crashCount}</span>
                  ) : (
                    "None"
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Current CPU Usage">
          <div className="flex justify-center py-4">
            <GaugeChart
              value={device.cpu}
              size={160}
              label="CPU"
              threshold={{ warning: 70, critical: 90 }}
            />
          </div>
        </DashboardCard>
        
        <DashboardCard title="Current RAM Usage">
          <div className="flex justify-center py-4">
            <GaugeChart
              value={device.ram}
              size={160}
              label="RAM"
              threshold={{ warning: 70, critical: 90 }}
            />
          </div>
        </DashboardCard>
        
        <DashboardCard title="Current Disk Usage">
          <div className="flex justify-center py-4">
            <GaugeChart
              value={device.disk.percentage}
              size={160}
              label={`${device.disk.used} GB / ${device.disk.total} GB`}
              threshold={{ warning: 70, critical: 90 }}
            />
          </div>
        </DashboardCard>
      </div>
      
      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="performance">
            <Cpu className="mr-2 h-4 w-4" /> Performance History
          </TabsTrigger>
          <TabsTrigger value="crashes">
            <AlertTriangle className="mr-2 h-4 w-4" /> Crash History
          </TabsTrigger>
          <TabsTrigger value="raw-data">
            <Database className="mr-2 h-4 w-4" /> Raw Telemetry
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="mt-6">
          <DashboardCard title="Performance Trends" description="Last 30 days">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={historicalData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [`${value}%`, name.toUpperCase()]} />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    name="CPU"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ram"
                    name="RAM"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="disk"
                    name="Disk"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </TabsContent>
        
        <TabsContent value="crashes" className="mt-6">
          <DashboardCard title="Crash Events" description="Recent system errors and crashes">
            {allCrashes.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CircleCheck className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No Crashes Detected</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This device has not experienced any crashes in the monitored period.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {allCrashes.map((crash, index) => (
                  <div key={index} className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{crash.source}</h3>
                          <Badge variant="outline" className="text-xs">
                            Event ID: {crash.eventId}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {crash.message}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {crash.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </TabsContent>
        
        <TabsContent value="raw-data" className="mt-6">
          <DashboardCard title="Raw Telemetry Data" description="JSON format">
            <Accordion type="single" collapsible className="w-full">
              {deviceHistory.slice(0, 7).map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>
                    {format(parseISO(item.timestamp), "MMMM d, yyyy")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-xs">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeviceDetailsPage;
