import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Server, User, Calendar, HardDrive, Cpu, Database,
  AlertTriangle, Clock, CheckCircle,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import GaugeChart from "@/components/Dashboard/GaugeChart";
import StatusBadge from "@/components/Dashboard/StatusBadge";

// Define the Perfect theme configuration
const theme = {
  primary: "bg-indigo-600 dark:bg-indigo-500",
  primaryHover: "hover:bg-indigo-700 dark:hover:bg-indigo-600",
  secondary: "bg-gray-100 dark:bg-gray-800",
  text: "text-gray-900 dark:text-gray-100",
  textMuted: "text-gray-600 dark:text-gray-400",
  accent: "bg-indigo-100 dark:bg-indigo-900",
  border: "border-gray-200 dark:border-gray-700",
  cardBg: "bg-white dark:bg-gray-900",
  shadow: "shadow-lg hover:shadow-xl transition-shadow duration-300",
  transition: "transition-all duration-200 ease-in-out",
};

// SectionContainer with themed styling
const SectionContainer = ({ children }) => (
  <div className={`${theme.cardBg} ${theme.border} rounded-xl ${theme.shadow} p-6`}>
    {children}
  </div>
);
import config from '../lib/config';
const apiUrl = config.apiUrl;



const DeviceDetailsPage = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<any>(null);
  const [deviceLogs, setDeviceLogs] = useState([]);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [crashLogs, setCrashLogs] = useState([]);

  useEffect(() => {
    if (!deviceId) return;

    const fetchDeviceLogs = async () => {
      try {
        const params = new URLSearchParams({ deviceId });
        const response = await fetch(`http://${apiUrl}/api/device/log?${params}`);
        const data = await response.json();
        return data.devicelogs;
      } catch (err) {
        return [];
      }
    };

    const loadData = async () => {
      setLoading(true);
      const logs = await fetchDeviceLogs();
      setDeviceLogs(logs);
      setLoading(false);
    };

    loadData();
  }, [deviceId]);

  useEffect(() => {
    if (!deviceLogs?.length) return;

    const lastLog = deviceLogs[deviceLogs.length - 1];
    setDevice(lastLog);

    const chartData = deviceLogs.map((item) => ({
      date: format(parseISO(item.date), "MM/dd"),
      cpu: item.cpu,
      ram: item.ram,
      disk: item.diskUsing,
      crashes: item.crashesCnt,
    }));

    setHistoricalData(chartData);

    const fetchCrashData = async () => {
      const crashes = [];
      const history = [];

      for (const log of deviceLogs) {
        if (!log.payloadUrl) continue;
        try {
          const params = new URLSearchParams({ file: log.payloadUrl });
          const response = await fetch(`http://${apiUrl}/api/jsonfile?${params}`);
          const json = await response.json();
          history.push(json);
          if (json.crashes?.length) crashes.push(...json.crashes);
        } catch (err) {
          console.error("Crash fetch error:", err);
        }
      }

      setCrashLogs(crashes);
      setDeviceHistory(history);
    };

    fetchCrashData();
  }, [deviceLogs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme.primary} mx-auto`} />
          <p className={`mt-4 ${theme.textMuted}`}>Loading device details...</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className={`text-center py-12 ${theme.cardBg} rounded-xl ${theme.shadow}`}>
        <AlertTriangle className="h-12 w-12 mx-auto text-amber-500" />
        <h2 className={`text-2xl font-semibold mt-4 ${theme.text}`}>Device Not Found</h2>
        <p className={`text-muted-foreground mt-2 ${theme.textMuted}`}>
          The device you're looking for doesn't exist or has been removed.
        </p>
        <Button className={`${theme.primary} ${theme.primaryHover} mt-4 ${theme.transition}`} onClick={() => navigate("/devices")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Devices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 rounded-xl">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={`${theme.accent} ${theme.primaryHover} ${theme.transition}`}
          onClick={() => navigate("/devices")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Devices
        </Button>
      </div>

      <SectionContainer>
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Server className={`h-12 w-12 ${theme.primary} p-2 ${theme.accent} rounded-lg`} />
            <div>
              <h1 className={`text-2xl font-semibold ${theme.text}`}>{device.computerName}</h1>
              <div className={`text-sm ${theme.textMuted}`}>
                <span className="mr-2">Device ID: {deviceId}</span>
                <span className="mr-2">OS: {device.osVersionFull}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div className={theme.text}>
              <User className={`h-4 w-4 ${theme.textMuted} mr-1 inline`} /> {device.loggedOnUser}
            </div>
            <div className={theme.text}>
              <Calendar className={`h-4 w-4 ${theme.textMuted} mr-1 inline`} />{" "}
              {format(parseISO(device.timestamp), "yyyy-MM-dd HH:mm:ss")}
            </div>
            <div className={theme.text}>
              <AlertTriangle className="h-4 w-4 text-red-500 inline mr-1" />
              Crashes: {device.crashesCnt || "0"}, BSOD: {device.blobCnt || "0"}
            </div>
          </div>
        </div>
      </SectionContainer>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          title="CPU Usage"
          icon={<Cpu className="text-indigo-500" />}
          className={`${theme.cardBg} ${theme.shadow} rounded-xl`}
        >
          <GaugeChart
            value={device.cpu}
            size={160}
            label="CPU"
            threshold={{ warning: 70, critical: 90 }}
            className={theme.transition}
          />
          <div className={`text-sm ${theme.textMuted} text-center mt-2`}>
            Cores: {device.cpuCores}
          </div>
        </DashboardCard>

        <DashboardCard
          title="RAM Usage"
          icon={<HardDrive className="text-green-500" />}
          className={`${theme.cardBg} ${theme.shadow} rounded-xl`}
        >
          <GaugeChart
            value={device.ram}
            size={160}
            label="RAM"
            threshold={{ warning: 70, critical: 90 }}
            className={theme.transition}
          />
          <div className={`text-sm ${theme.textMuted} text-center mt-2`}>
            Size: {device.ramSizeGB} GB
          </div>
        </DashboardCard>

        <DashboardCard
          title="Disk Usage"
          icon={<Database className="text-purple-500" />}
          className={`${theme.cardBg} ${theme.shadow} rounded-xl`}
        >
          <GaugeChart
            value={device.diskUsing}
            size={160}
            label="Disk"
            threshold={{ warning: 70, critical: 90 }}
            className={theme.transition}
          />
          <div className={`text-sm ${theme.textMuted} text-center mt-2`}>
            {device.diskUseSpace} / {device.disk}
          </div>
        </DashboardCard>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className={`grid w-full grid-cols-3 ${theme.secondary} rounded-xl p-1 ${theme.border}`}>
          <TabsTrigger
            value="performance"
            className={`${theme.accent} ${theme.primaryHover} ${theme.transition} rounded-lg`}
          >
            <Cpu className="h-4 w-4 mr-2" /> Performance
          </TabsTrigger>
          <TabsTrigger
            value="crashes"
            className={`${theme.accent} ${theme.primaryHover} ${theme.transition} rounded-lg`}
          >
            <AlertTriangle className="h-4 w-4 mr-2" /> Crashes
          </TabsTrigger>
          <TabsTrigger
            value="raw-data"
            className={`${theme.accent} ${theme.primaryHover} ${theme.transition} rounded-lg`}
          >
            <Database className="h-4 w-4 mr-2" /> Raw Telemetry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <DashboardCard
            title="Performance Trends"
            description="Last 30 days"
            className={`${theme.cardBg} ${theme.shadow} rounded-xl`}
          >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.textMuted} />
                <XAxis dataKey="date" stroke={theme.text} />
                <YAxis stroke={theme.text} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.cardBg,
                    border: theme.border,
                    borderRadius: "8px",
                    color: theme.text,
                  }}
                />
                <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="ram" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="disk" stroke="#8B5CF6" strokeWidth={2} />
                <Line type="monotone" dataKey="crashes" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </DashboardCard>
        </TabsContent>

        <TabsContent value="crashes">
          <DashboardCard
            title="Crash Events"
            className={`${theme.cardBg} ${theme.shadow} rounded-xl`}
          >
            {crashLogs.length === 0 ? (
              <div className={`text-center py-12 ${theme.textMuted}`}>
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                No crashes detected.
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {crashLogs.map((crash, idx) => (
                  <div key={idx} className="py-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${theme.accent}`}>
                        <AlertTriangle className="text-red-500 h-5 w-5" />
                      </div>
                      <div>
                        <h3 className={`font-medium ${theme.text}`}>{crash.source}</h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${theme.border} ${theme.text}`}
                        >
                          Event ID: {crash.eventId}
                        </Badge>
                        <p className={`text-sm mt-1 ${theme.textMuted}`}>{crash.message}</p>
                        <p className={`text-xs mt-1 ${theme.textMuted}`}>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {format(parseISO(crash.timestamp), "yyyy-MM-dd HH:mm:ss")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </TabsContent>

        <TabsContent value="raw-data">
          <DashboardCard
            title="Raw Telemetry Data"
            description="First 7 logs"
            className={`${theme.cardBg} ${theme.shadow} rounded-xl`}
          >
            <Accordion type="single" collapsible>
              {deviceHistory.slice(0, 7).map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className={`${theme.text} ${theme.transition}`}>
                    {format(parseISO(item.timestamp), "MMMM d, yyyy")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className={`text-xs ${theme.secondary} p-4 rounded-md overflow-x-auto ${theme.text}`}>
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