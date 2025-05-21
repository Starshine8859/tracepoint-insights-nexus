import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Cpu,
  HardDrive,
  AlertTriangle,
  Database,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import StatCard from "@/components/Dashboard/StatCard";
import GaugeChart from "@/components/Dashboard/GaugeChart";
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
import config from '../lib/config';
const apiUrl = config.apiUrl;

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
  const [osDistribution, setOsDistribution] = useState([]);
  const [lastUpdatedDevice, setLastUpdatedDevice] = useState(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

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
          `http://${apiUrl}/api/devices_laststatus?${params}`,
          {
            method: "GET",
          }
        );
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        const data = await response.json();
        setDevices(data.devices);
      } catch (error) {
        console.error("Failed to fetch device data:", error);
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
        : null
    );

    const latestDevices = devices
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    const trends = latestDevices.reverse().map((device) => ({
      DeviceId: device.rowKey,
      Cpu: device.cpu,
      Ram: device.ram,
      Disk: device.diskUsing,
      crashCount: device.crashesCnt,
    }));

    setTrendData(trends);
  }, [devices]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center select-none">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 select-none">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            onClick={() => navigate("/devices")}
            className="shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <Database className="mr-2 h-4 w-4" /> 
            View All Devices
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Devices"
          value={devices.length}
          icon={<Database className="h-6 w-6" />}
          color="blue"
          className="hover:scale-102 transition-transform duration-200"
        />
        <StatCard
          title="Connected Today"
          value={devices.filter(
            (d) => d.timestamp > new Date().toISOString().split("T")[0]
          ).length}
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
          className="hover:scale-102 transition-transform duration-200"
        />
        <StatCard
          title="Offline Devices"
          value={devices.filter(
            (d) => d.timestamp < new Date().toISOString().split("T")[0]
          ).length}
          icon={<HardDrive className="h-6 w-6" />}
          color="amber"
          className="hover:scale-102 transition-transform duration-200"
        />
        <StatCard
          title="Total Errors"
          value={devices.reduce((sum, item) => sum + (item.crashesCnt || 0), 0)}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
          className="hover:scale-102 transition-transform duration-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard
          title="Latest Device Status"
          description={lastUpdatedDevice ? `Device ID: ${lastUpdatedDevice.rowKey}` : "No devices"}
          className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
        >
          <div className="flex flex-wrap justify-around gap-6 mt-8">
            <GaugeChart
              value={lastUpdatedDevice?.cpu ?? 0}
              label="CPU Usage"
              className="hover:scale-105 transition-transform duration-200"
            />
            <GaugeChart
              value={lastUpdatedDevice?.ram ?? 0}
              label="RAM Usage"
              className="hover:scale-105 transition-transform duration-200"
            />
            <GaugeChart
              value={lastUpdatedDevice?.diskUsing ?? 0}
              label="Disk Usage"
              className="hover:scale-105 transition-transform duration-200"
            />
          </div>
        </DashboardCard>

        <DashboardCard 
          title="OS Distribution"
          className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
        >
          <div className="h-[300px]">
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
                      className="hover:opacity-80 transition-opacity duration-200"
                    />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm font-medium">{value}</span>
                  )}
                />
                <Tooltip 
                  formatter={(value) => [`${value} devices`, "Count"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard
        title="Performance Trends"
        className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
      >
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="DeviceId"
                tickFormatter={(value) => value.split("-")[0]}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value, name) => [
                  `${value}%`,
                  name.replace(/([A-Z])/g, " $1").trim(),
                ]}
              />
              <Bar 
                dataKey="Cpu" 
                name="CPU" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity duration-200"
              />
              <Bar 
                dataKey="Ram" 
                name="RAM" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity duration-200"
              />
              <Bar 
                dataKey="Disk" 
                name="Disk" 
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      <DashboardCard
        title="Crash Summary"
        className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50"
      >
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="DeviceId"
                tickFormatter={(value) => value.split("-")[0]}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar 
                dataKey="crashCount" 
                name="Crashes" 
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity duration-200"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>
    </div>
  );
};

export default Index;