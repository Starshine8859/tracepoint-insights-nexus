import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cpu,
  HardDrive,
  AlertTriangle,
  Database,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import StatCard from "@/components/Dashboard/StatCard";
import GaugeChart from "@/components/Dashboard/GaugeChart";
import DevicesTable from "@/components/Dashboard/DevicesTable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  MOCK_DEVICES,
  MOCK_TRENDS,
  MOCK_OS_DISTRIBUTION,
} from "@/lib/mock-data";

export type TrendData = {
  DeviceId: string;
  Cpu: number;
  Ram: number;
  Disk: number;
  crashCount: number;
};

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [trends, setTrends] = useState(MOCK_TRENDS.slice(-14)); // Last 14 days
  const [osDistribution, setOsDistribution] = useState([]);
  const [lastUpdatedDevice, setLastUpdatedDevice] = useState(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  const totalDevices = devices.length;

  const avgCpu = Math.round(
    devices.reduce((sum, d) => sum + d.cpu, 0) / totalDevices
  );
  const avgRam = Math.round(
    devices.reduce((sum, d) => sum + d.ram, 0) / totalDevices
  );
  const avgDiskUsage = Math.round(
    devices.reduce((sum, d) => sum + d.disk.percentage, 0) / totalDevices
  );

  // Calculate total crashes in the last 14 days
  const totalCrashes = trends.reduce((sum, day) => sum + day.crashCount, 0);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const getDeviceData = async () => {
      setLoading(true);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      try {
        const params = new URLSearchParams({
          deviceId: "",
          computerName: "",
          loggedUser: "",
          dateFrom: thirtyDaysAgo.toISOString() || "",
          dateTo: now.toISOString() || "",
        }).toString();

        const response = await fetch(
          `http://localhost:3000/api/devices_laststatus?${params}`,
          {
            method: "GET",
          }
        );
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        const data = await response.json();
        setDevices(data.devices); // Expected to return device data array
      } catch (error) {
        // return []; // Return empty array on failure
      }
      setLoading(false);
    };
    getDeviceData();
  }, []);

  useEffect(() => {
    setOsDistribution([
      {
        name: "Windows 11",
        count: devices.filter((item) => item.osVersion === "Windows 11").length,
      },
      {
        name: "Windows 10",
        count: devices.filter((item) => item.osVersion === "Windows 10").length,
      },
      {
        name: "Other",
        count: devices.filter(
          (item) => !["Windows 11", "Windows 10"].includes(item.osVersion)
        ).length,
      },
    ]);
    setLastUpdatedDevice(
      devices.length > 0
        ? devices.reduce((latest, item) => {
            return new Date(item.timestamp) > new Date(latest.timestamp)
              ? item
              : latest;
          }, devices[0])
        : ""
    );

    //Recent Performance Trends
    const trends: TrendData[] = [];
    const today = new Date();

    const latestDevices = devices
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10); // Take the top 10 most recent devices

    for (let i = latestDevices.length - 1; i >= 0; i--) {
      const dayTrend: TrendData = {
        DeviceId: latestDevices[i].rowKey,
        Cpu: latestDevices[i].cpu,
        Ram: latestDevices[i].ram,
        Disk: latestDevices[i].diskUsing,
        crashCount: latestDevices[i].crashesCnt, // More crashes on certain days
      };
      trends.push(dayTrend);
    }
    setTrendData(trends);
  }, [devices]);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/trends")}
          >
            <TrendingUp className="mr-2 h-4 w-4" /> View All Trends
          </Button> */}
          <Button size="sm" onClick={() => navigate("/devices")}>
            <Database className="mr-2 h-4 w-4" /> View All Devices
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Devices"
          value={devices.length}
          icon={<Database className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Today Connected Devices"
          value={
            devices.filter(
              (d) => d.timestamp > new Date().toISOString().split("T")[0]
            ).length
          }
          icon={<Cpu className="h-6 w-6" />}
          delta={Math.round(
            (devices.filter(
              (d) => d.timestamp > new Date().toISOString().split("T")[0]
            ).length /
              devices.length) *
              100
          )}
          deltaLabel="of total"
          color="green"
        />
        <StatCard
          title="Today not Connected Devices"
          value={
            devices.filter(
              (d) => d.timestamp < new Date().toISOString().split("T")[0]
            ).length
          }
          icon={<HardDrive className="h-6 w-6" />}
          color="amber"
        />
        <StatCard
          title="Last Connected Devices Error "
          value={devices.reduce((sum, item) => sum + item.crashesCnt, 0)}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard
          title={`Last updated device on ${
            lastUpdatedDevice != null ? lastUpdatedDevice.timestamp : "N/A"
          }`}
          description={`${
            lastUpdatedDevice != null ? lastUpdatedDevice.rowKey : "N/A"
          }`}
        >
          <div className="flex flex-wrap justify-around gap-4 mt-6">
            <GaugeChart
              value={lastUpdatedDevice?.cpu ?? "N/A"}
              label="CPU Usage"
            />
            <GaugeChart
              value={
                lastUpdatedDevice.ram == undefined
                  ? "N/A"
                  : lastUpdatedDevice.ram
              }
              label="RAM Usage"
            />
            <GaugeChart
              value={
                lastUpdatedDevice.diskUsing === undefined
                  ? "N/A"
                  : lastUpdatedDevice.diskUsing
              }
              label="Disk Usage"
            />
          </div>
        </DashboardCard>

        <DashboardCard title="Operating System Distribution">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={osDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="name"
                >
                  {osDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip formatter={(value) => [`${value} devices`, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard
        title="Recent Performance Trends"
        // description="Last 14 days rolling average"
        // footer={
        //   <Button variant="ghost" size="sm" onClick={() => navigate("/trends")}>
        //     View detailed trends <ArrowRight className="ml-1 h-4 w-4" />
        //   </Button>
        // }
      >
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="DeviceId"
                tickFormatter={(value) => {
                  const parts = value.split("-");
                  return `${parts[0]}`;
                }}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  const formattedName =
                    typeof name === "string"
                      ? name.replace(/([A-Z])/g, " $1").trim()
                      : name;
                  return [`${value}%`, formattedName];
                }}
              />
              <Bar dataKey="Cpu" name="CPU" fill="#3B82F6" />
              <Bar dataKey="Ram" name="RAM" fill="#10B981" />
              <Bar dataKey="Disk" name="Disk" fill="#E0B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      {/* <DashboardCard
        title="Recent Device Activity"
        description="Showing devices with potential issues"
        footer={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/devices")}
          >
            View all devices <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        }
      >
        <DevicesTable 
          devices={devices
            .sort((a, b) => {
              // Sort by status priority: error > warning > offline > online
              const priority = { error: 3, warning: 2, offline: 1, online: 0 };
              return priority[b.status] - priority[a.status];
            })
            .slice(0, 5)} 
        />
      </DashboardCard> */}

      <DashboardCard
        title="Crash Summary"
        // description={`${totalCrashes} crashes detected in the last 14 days`}
        // footer={
        //   <Button
        //     variant="ghost"
        //     size="sm"
        //     onClick={() => navigate("/crashes")}
        //   >
        //     View crash analysis <ArrowRight className="ml-1 h-4 w-4" />
        //   </Button>
        // }
      >
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="DeviceId"
                tickFormatter={(value) => {
                  const parts = value.split("-");
                  return `${parts[0]}`;
                }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="crashCount" name="Crashes" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>
    </div>
  );
};

export default Index;
