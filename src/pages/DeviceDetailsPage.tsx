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
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import GaugeChart from "@/components/Dashboard/GaugeChart";
import StatusBadge from "@/components/Dashboard/StatusBadge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format, parseISO, subDays } from "date-fns";

const DeviceDetailsPage = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState(null);
  const [deviceLogs, setDeviceLogs] = useState([]);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [crashLogs, setCrashLogs] = useState([]);

  useEffect(() => {
    if (!deviceId) return;

    async function fetchDeviceLogs() {
      try {
        const params = new URLSearchParams({
          deviceId: deviceId || "",
        }).toString();
        const response = await fetch(
          `http://localhost:3000/api/device/log?${params}`,
          {
            method: "GET",
          }
        );
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.devicelogs; // Expected to return device data array
      } catch (error) {
        return []; // Return empty array on failure
      }
    }

    // Simulate API call to fetch device details
    const fetchDevice = async () => {
      setLoading(true);
      try {
        setDeviceLogs(await fetchDeviceLogs());
      } catch (error) {
        console.error("Error fetching device details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevice();
  }, [deviceId]);

  useEffect(() => {
    if (!deviceLogs || deviceLogs.length === 0) return;
    setLoading(true);
    console.log("Device Logs:", deviceLogs);
    const lastLog = deviceLogs[deviceLogs.length - 1];
    setDevice(lastLog);

    const chartData = deviceLogs.map((item) => ({
      date: format(parseISO(item.date), "MM/dd"),
      cpu: item.cpu,
      ram: item.ram,
      disk: item.diskUsing,
      crashes: item.crashesCnt,
      rawDate: item.date,
    }));
    setHistoricalData(chartData);

    const fetchCrash = async () => {
      const crashdata = [];
      const jsondata = [];
      if (!device || !device.rowKey) {
        return crashdata;
      }
      for (let i = 0; i < deviceLogs.length; i++) {
        if (deviceLogs[i].payloadUrl !== undefined) {
          const params = new URLSearchParams({
            file: deviceLogs[i].payloadUrl,
          }).toString();
          try {
            const response = await fetch(
              `http://localhost:3000/api/jsonfile?${params}`,
              {
                method: "GET",
              }
            );
            if (response.ok) {
              const temp = await response.json();
              jsondata.push(temp);
              for (let i = 0; i < temp.crashes.length; i++) {
                crashdata.push(temp.crashes[i]);
              }
            }
          } catch (error) {
            console.error("Error fetching crash data:", error);
          }
        }
      }
      setCrashLogs(crashdata);
      setDeviceHistory(jsondata);
    };

    fetchCrash();
    setLoading(false);
  }, [deviceLogs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Loading device details...
          </p>
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
        <Button className="mt-4" onClick={() => navigate("/devices")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Devices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/devices")}>
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
                <span className="mr-2">Device ID: {deviceId}</span>
                {/* <StatusBadge status={device.status} /> */}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 md:gap-8">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  User
                </div>
                <div className="font-medium">{device.loggedOnUser}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last Seen
                </div>
                <div className="font-medium">
                  {format(parseISO(device.timestamp), "yyyy-MM-dd HH:mm:ss")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Crashes
                </div>
                <div className="font-medium">
                  {device.crashesCnt > 0 ? (
                    <span className="text-red-500">{device.crashesCnt}</span>
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
              value={device.diskUsing}
              size={160}
              label="Hard"
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
                  <Tooltip
                    formatter={(value, name, unit) => {
                      // Fix type issue by checking if name is a string before calling toUpperCase
                      const formattedName =
                        typeof name === "string" ? name.toUpperCase() : name;
                      return [`${value}`, formattedName];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cpu"
                    name="CPU"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    unit="%"
                  />
                  <Line
                    type="monotone"
                    dataKey="ram"
                    name="RAM"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                    unit="%"
                  />
                  <Line
                    type="monotone"
                    dataKey="disk"
                    name="Disk"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={false}
                    unit="%"
                  />
                  <Line
                    type="monotone"
                    dataKey="crashes"
                    name="Crashes"
                    stroke="#FF5516"
                    strokeWidth={2}
                    dot={false}
                    unit=""
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="crashes" className="mt-6">
          <DashboardCard
            title="Crash Events"
            description="Recent system errors and crashes"
          >
            {crashLogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="mt-4 text-lg font-medium">
                  No Crashes Detected
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This device has not experienced any crashes in the monitored
                  period.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {crashLogs.map((crash, index) => (
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
                          {format(
                            parseISO(crash.timestamp),
                            "yyyy-MM-dd HH:mm:ss"
                          )}
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
