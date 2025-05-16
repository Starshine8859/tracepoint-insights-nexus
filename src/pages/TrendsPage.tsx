
import { useState } from "react";
import {
  TrendingUp,
  Calendar,
  Download
} from "lucide-react";
import {
  LineChart,
  Line,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import { MOCK_TRENDS } from "@/lib/mock-data";

const TrendsPage = () => {
  const [timeRange, setTimeRange] = useState("30");
  
  // Filter trends data based on time range
  const trends = MOCK_TRENDS.slice(-parseInt(timeRange));
  
  // Calculate averages
  const avgCpu = Math.round(
    trends.reduce((sum, day) => sum + day.avgCpu, 0) / trends.length
  );
  const avgRam = Math.round(
    trends.reduce((sum, day) => sum + day.avgRam, 0) / trends.length
  );
  const avgDisk = Math.round(
    trends.reduce((sum, day) => sum + day.avgDisk, 0) / trends.length
  );
  const totalCrashes = trends.reduce((sum, day) => sum + day.crashCount, 0);
  
  // Generate weekly averages for another view
  const weeklyData = [];
  for (let i = 0; i < trends.length; i += 7) {
    const weekChunk = trends.slice(i, i + 7);
    if (weekChunk.length > 0) {
      const weekStart = weekChunk[0].date;
      const weekEnd = weekChunk[weekChunk.length - 1].date;
      
      weeklyData.push({
        week: `${weekStart} to ${weekEnd}`,
        avgCpu: Math.round(
          weekChunk.reduce((sum, day) => sum + day.avgCpu, 0) / weekChunk.length
        ),
        avgRam: Math.round(
          weekChunk.reduce((sum, day) => sum + day.avgRam, 0) / weekChunk.length
        ),
        avgDisk: Math.round(
          weekChunk.reduce((sum, day) => sum + day.avgDisk, 0) / weekChunk.length
        ),
        crashCount: weekChunk.reduce((sum, day) => sum + day.crashCount, 0),
      });
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Performance Trends</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
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
            Export Data
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard title="Avg. CPU Usage">
          <div className="flex flex-col items-center py-4">
            <div className="text-4xl font-bold">{avgCpu}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last {timeRange} days
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Avg. RAM Usage">
          <div className="flex flex-col items-center py-4">
            <div className="text-4xl font-bold">{avgRam}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last {timeRange} days
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Avg. Disk Usage">
          <div className="flex flex-col items-center py-4">
            <div className="text-4xl font-bold">{avgDisk}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last {timeRange} days
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Total Crashes">
          <div className="flex flex-col items-center py-4">
            <div className="text-4xl font-bold text-red-500">{totalCrashes}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last {timeRange} days
            </div>
          </div>
        </DashboardCard>
      </div>
      
      <Tabs defaultValue="daily">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Daily Trends</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Aggregates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-6">
          <DashboardCard title="Daily Performance Metrics" description={`Last ${timeRange} days`}>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgCpu"
                    name="CPU Usage (%)"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgRam"
                    name="RAM Usage (%)"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgDisk"
                    name="Disk Usage (%)"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="crashCount"
                    name="Crash Count"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <DashboardCard title="CPU Usage Over Time">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgCpu" name="CPU %" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
            
            <DashboardCard title="Daily Crash Count">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="crashCount" name="Crashes" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-6">
          <DashboardCard title="Weekly Aggregated Metrics" description="Averaged by week">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="avgCpu"
                    name="CPU Usage (%)"
                    fill="#3B82F6"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="avgRam"
                    name="RAM Usage (%)"
                    fill="#10B981"
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="avgDisk"
                    name="Disk Usage (%)"
                    fill="#8B5CF6"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="crashCount"
                    name="Crash Count"
                    fill="#EF4444"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrendsPage;
