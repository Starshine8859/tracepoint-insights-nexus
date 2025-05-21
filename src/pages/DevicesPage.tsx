import { useState, useMemo, useEffect } from "react";
import {
  HardDrive,
  Search,
  AlertTriangle,
  CircleCheck,
  CircleAlert,
  CircleX,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DevicesTable from "@/components/Dashboard/DevicesTable";
import { MOCK_DEVICES } from "@/lib/mock-data";
import { DateRange } from "react-day-picker";
import {
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  subDays,
  endOfDay,
} from "date-fns";
import config from '../lib/config';
const apiUrl = config.apiUrl;


const DevicesPage = () => {
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [computerName, setComputerName] = useState("");
  const [loggedUser, setLoggedUser] = useState("");
  const [deviceList, setDeviceList] = useState([]);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 6), // 7-day range including today
    to: endOfDay(new Date()),
  });

  async function getDevicesData({
    deviceId,
    computerName,
    loggedUser,
    dateRange,
  }: {
    deviceId?: string;
    computerName?: string;
    loggedUser?: string;
    dateRange: { from: Date | null; to: Date | null };
  }) {
    try {
      const params = new URLSearchParams({
        deviceId: deviceId || "",
        computerName: computerName || "",
        loggedUser: loggedUser || "",
        dateFrom: dateRange.from?.toISOString() || "",
        dateTo: dateRange.to?.toISOString() || "",
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
      return data.devices; // Expected to return device data array
    } catch (error) {
      return []; // Return empty array on failure
    }
  }

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      const data = await getDevicesData({
        deviceId,
        computerName,
        loggedUser,
        dateRange: { from: dateRange.from, to: dateRange.to },
      });
      setDeviceList(data); // Update state with fetched data
      setLoading(false);
    };

    fetchDevices();
  }, [dateRange]);

  const filteredDevices = useMemo(() => {
    return deviceList.filter((device) => {
      // Filter by search term
      const searchMatch =
        device.rowKey.toLowerCase().includes(deviceId.toLowerCase()) &&
        device.computerName.toLowerCase().includes(computerName.toLowerCase()) &&
        device.loggedOnUser.toLowerCase().includes(loggedUser.toLowerCase());
            
      return searchMatch;
    });
  }, [deviceList, deviceId, computerName, loggedUser]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <HardDrive className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Devices : {filteredDevices.length}</h1>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Deviced ID"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Computer Name"
            value={computerName}
            onChange={(e) => setComputerName(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Logged On User"
            value={loggedUser}
            onChange={(e) => setLoggedUser(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative w-full sm:w-64 md:w-80">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
        </div>
      </div>

      {loading ? (
        <div className="w-full flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <DevicesTable devices={filteredDevices} />
      )}

      { filteredDevices.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            No devices found matching
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setDeviceId("");
              setComputerName("");
              setLoggedUser("");
              setDateRange({
                from: subDays(new Date(), 6), // 7-day range including today
                to: endOfDay(new Date()),
              });
            }}
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
