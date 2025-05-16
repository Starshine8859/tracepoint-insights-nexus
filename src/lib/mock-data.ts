
import { format, subDays, addDays } from "date-fns";

export type TelemetryData = {
  deviceId: string;
  computerName: string;
  loggedOnUser: string;
  timestamp: string;
  performance: {
    cpu: number;
    ram: number;
    disk: {
      used: number;
      total: number;
    };
  };
  crashes: {
    eventId: number;
    timestamp: string;
    source: string;
    message: string;
  }[];
};

export type DeviceSummary = {
  deviceId: string;
  computerName: string;
  loggedOnUser: string;
  lastSeen: string;
  cpu: number;
  ram: number;
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  crashCount: number;
  status: "online" | "offline" | "warning" | "error";
};

export type OSDistribution = {
  name: string;
  count: number;
};

export type TrendData = {
  date: string;
  avgCpu: number;
  avgRam: number;
  avgDisk: number;
  crashCount: number;
};

const users = [
  "CORP\\j.doe",
  "CORP\\a.smith",
  "CORP\\m.johnson",
  "CORP\\r.williams",
  "CORP\\l.brown",
  "CORP\\p.davis",
  "CORP\\c.miller",
  "CORP\\admin",
];

const computerPrefixes = [
  "LAPTOP-",
  "DESKTOP-",
  "WORKSTATION-",
  "DEV-",
  "QA-",
  "PROD-",
];

const departments = ["IT", "ENG", "HR", "FIN", "MKT", "SALES", "EXEC", "R&D"];

const crashSources = [
  "Application Error",
  "Windows Error Reporting",
  "BugCheck",
  "Service Control Manager",
  ".NET Runtime",
  "Application Hang",
];

const crashMessages = [
  "Faulting module: example.exe",
  "The application stopped responding",
  "Access violation in module ntdll.dll",
  "The process terminated unexpectedly",
  "Unhandled exception in kernel32.dll",
  "Failed with HRESULT: 0x8007FFFF",
  "Stack overflow in iexplore.exe",
  "Out of memory in chrome.exe",
];

function generateGuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateComputerName(): string {
  const prefix = computerPrefixes[Math.floor(Math.random() * computerPrefixes.length)];
  const dept = departments[Math.floor(Math.random() * departments.length)];
  const num = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
  return `${prefix}${dept}${num}`;
}

function generateTelemetry(
  deviceId: string,
  computerName: string,
  date: Date
): TelemetryData {
  const cpu = 5 + Math.floor(Math.random() * 70); // 5-75%
  const ram = 10 + Math.floor(Math.random() * 70); // 10-80%
  const diskTotal = 256 + Math.floor(Math.random() * 5) * 256; // 256, 512, 768, 1024, 1280
  const diskUsed = Math.floor((diskTotal * (20 + Math.random() * 60)) / 100); // 20-80% usage
  
  const crashCount = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0;
  const crashes = [];
  
  for (let i = 0; i < crashCount; i++) {
    const crashTime = new Date(date);
    crashTime.setHours(Math.floor(Math.random() * 24));
    crashTime.setMinutes(Math.floor(Math.random() * 60));
    
    crashes.push({
      eventId: 1000 + Math.floor(Math.random() * 100),
      timestamp: crashTime.toISOString(),
      source: crashSources[Math.floor(Math.random() * crashSources.length)],
      message: crashMessages[Math.floor(Math.random() * crashMessages.length)],
    });
  }
  
  return {
    deviceId,
    computerName,
    loggedOnUser: users[Math.floor(Math.random() * users.length)],
    timestamp: date.toISOString(),
    performance: {
      cpu,
      ram,
      disk: {
        used: diskUsed,
        total: diskTotal,
      },
    },
    crashes,
  };
}

// Generate devices with consistent properties
export const generateDevices = (count: number): DeviceSummary[] => {
  const devices: DeviceSummary[] = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const deviceId = generateGuid();
    const computerName = generateComputerName();
    const lastSeenDate = subDays(today, Math.random() > 0.9 ? Math.floor(Math.random() * 30) : 0);
    const telemetry = generateTelemetry(deviceId, computerName, lastSeenDate);
    
    const diskPercentage = Math.floor(
      (telemetry.performance.disk.used / telemetry.performance.disk.total) * 100
    );
    
    let status: "online" | "offline" | "warning" | "error" = "online";
    
    const daysDifference = Math.floor(
      (today.getTime() - new Date(telemetry.timestamp).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDifference > 5) {
      status = "offline";
    } else if (telemetry.crashes.length > 0) {
      status = "error";
    } else if (
      telemetry.performance.cpu > 90 ||
      telemetry.performance.ram > 90 ||
      diskPercentage > 90
    ) {
      status = "warning";
    }
    
    devices.push({
      deviceId: telemetry.deviceId,
      computerName: telemetry.computerName,
      loggedOnUser: telemetry.loggedOnUser,
      lastSeen: telemetry.timestamp,
      cpu: telemetry.performance.cpu,
      ram: telemetry.performance.ram,
      disk: {
        used: telemetry.performance.disk.used,
        total: telemetry.performance.disk.total,
        percentage: diskPercentage,
      },
      crashCount: telemetry.crashes.length,
      status,
    });
  }
  
  return devices;
};

// Generate historical data for trends
export const generateTrends = (days: number): TrendData[] => {
  const trends: TrendData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dayTrend: TrendData = {
      date: format(date, "yyyy-MM-dd"),
      avgCpu: 20 + Math.floor(Math.random() * 40),
      avgRam: 30 + Math.floor(Math.random() * 40),
      avgDisk: 40 + Math.floor(Math.random() * 30),
      crashCount: Math.floor(Math.random() * (i % 7 === 0 ? 10 : 5)), // More crashes on certain days
    };
    trends.push(dayTrend);
  }
  
  return trends;
};

// Generate OS distribution data
export const generateOSDistribution = (): OSDistribution[] => {
  return [
    { name: "Windows 10", count: 420 },
    { name: "Windows 11", count: 380 },
    { name: "Windows Server 2019", count: 120 },
    { name: "Windows Server 2022", count: 80 },
  ];
};

// Generate telemetry history for a specific device
export const generateDeviceHistory = (
  deviceId: string,
  computerName: string,
  days: number
): TelemetryData[] => {
  const history: TelemetryData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    history.push(generateTelemetry(deviceId, computerName, date));
  }
  
  return history;
};

export const MOCK_DEVICES = generateDevices(50);
export const MOCK_TRENDS = generateTrends(30);
export const MOCK_OS_DISTRIBUTION = generateOSDistribution();
