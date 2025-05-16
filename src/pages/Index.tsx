import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Cpu, HardDrive, AlertTriangle, Database, 
  Users, TrendingUp, ArrowRight
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
import { MOCK_DEVICES, MOCK_TRENDS, MOCK_OS_DISTRIBUTION } from "@/lib/mock-data";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [trends, setTrends] = useState(MOCK_TRENDS.slice(-14)); // Last 14 days
  const [osDistribution, setOsDistribution] = useState(MOCK_OS_DISTRIBUTION);
  
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === "online").length;
  const offlineDevices = devices.filter(d => d.status === "offline").length;
  const warningDevices = devices.filter(d => d.status === "warning").length;
  const errorDevices = devices.filter(d => d.status === "error").length;
  
  const avgCpu = Math.round(devices.reduce((sum, d) => sum + d.cpu, 0) / totalDevices);
  const avgRam = Math.round(devices.reduce((sum, d) => sum + d.ram, 0) / totalDevices);
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/trends')}
          >
            <TrendingUp className="mr-2 h-4 w-4" /> View All Trends
          </Button>
          <Button 
            size="sm"
            onClick={() => navigate('/devices')}
          >
            <Database className="mr-2 h-4 w-4" /> View All Devices
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Devices"
          value={totalDevices}
          icon={<Database className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Online Devices"
          value={onlineDevices}
          icon={<Cpu className="h-6 w-6" />}
          delta={Math.round((onlineDevices / totalDevices) * 100)}
          deltaLabel="of total"
          color="green"
        />
        <StatCard
          title="Warning Devices"
          value={warningDevices}
          icon={<HardDrive className="h-6 w-6" />}
          color="amber"
        />
        <StatCard
          title="Error Devices"
          value={errorDevices}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="System Resource Usage" description="Average values across all devices">
          <div className="flex flex-wrap justify-around gap-4 mt-6">
            <GaugeChart value={avgCpu} label="CPU Usage" />
            <GaugeChart value={avgRam} label="RAM Usage" />
            <GaugeChart value={avgDiskUsage} label="Disk Usage" />
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
        description="Last 14 days rolling average"
        footer={
          <Button variant="ghost" size="sm" onClick={() => navigate('/trends')}>
            View detailed trends <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        }
      >
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trends}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const parts = value.split('-');
                  return `${parts[1]}/${parts[2]}`;
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  const formattedName = typeof name === 'string' ? name.replace(/([A-Z])/g, ' $1').trim() : name;
                  return [`${value}%`, formattedName];
                }}
              />
              <Bar dataKey="avgCpu" name="CPU" fill="#3B82F6" />
              <Bar dataKey="avgRam" name="RAM" fill="#10B981" />
              <Bar dataKey="crashCount" name="Crashes" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>
      
      <DashboardCard 
        title="Recent Device Activity"
        description="Showing devices with potential issues"
        footer={
          <Button variant="ghost" size="sm" onClick={() => navigate('/devices')}>
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
      </DashboardCard>
      
      <DashboardCard 
        title="Crash Summary" 
        description={`${totalCrashes} crashes detected in the last 14 days`}
        footer={
          <Button variant="ghost" size="sm" onClick={() => navigate('/crashes')}>
            View crash analysis <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        }
      >
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trends}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const parts = value.split('-');
                  return `${parts[1]}/${parts[2]}`;
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
