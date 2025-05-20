import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeviceSummary } from "@/lib/mock-data";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Eye } from "lucide-react";

type DevicesTableProps = {
  devices: DeviceSummary[];
  limit?: number;
};

const DevicesTable = ({ devices, limit }: DevicesTableProps) => {
  const navigate = useNavigate();

  const displayDevices = useMemo(() => {
    return limit ? devices.slice(0, limit) : devices;
  }, [devices, limit]);

  const handleViewDetails = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device ID</TableHead>
            <TableHead>Computer Name</TableHead>
            <TableHead className="hidden md:table-cell">OS</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="hidden md:table-cell">Last Seen</TableHead>
            <TableHead className="hidden lg:table-cell">CPU</TableHead>
            <TableHead className="hidden lg:table-cell">RAM</TableHead>
            <TableHead className="hidden lg:table-cell">Disk</TableHead>
            <TableHead className="hidden lg:table-cell">Crashes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayDevices.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center py-10 text-muted-foreground"
              >
                No devices found
              </TableCell>
            </TableRow>
          ) : (
            displayDevices.map((device, index) => {
              const lastSeen = parseISO(device.timestamp);
              return (
                <TableRow key={device.deviceId}>
                  <TableCell>{device.deviceId}</TableCell>
                  <TableCell className="font-medium">
                    {device.computerName}
                  </TableCell>
                  <TableCell>{device.osVersion}</TableCell>
                  <TableCell>{device.loggedOnUser}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">
                      <div>{format(lastSeen, "yyyy-MM-dd")}</div>
                      <div className="text-muted-foreground">
                        {formatDistanceToNow(lastSeen, { addSuffix: true })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {device.cpu}%
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {device.ram}%
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {device.disk}GB
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {device.crashesCnt > 0 ? (
                      <span className="text-red-500 font-medium">
                        {device.crashesCnt}
                      </span>
                    ) : (
                      device.crashesCnt
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(device.deviceId)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DevicesTable;
