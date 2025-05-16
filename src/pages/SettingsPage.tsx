
import { useState } from "react";
import { Settings, Save, RefreshCcw, Database, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { toast } = useToast();
  
  const [collectionInterval, setCollectionInterval] = useState(1);
  const [applicationLogs, setApplicationLogs] = useState(true);
  const [systemLogs, setSystemLogs] = useState(true);
  const [bsodLogs, setBsodLogs] = useState(true);
  const [storagePath, setStoragePath] = useState("https://tracepoint.blob.core.windows.net/telemetry");
  const [retention, setRetention] = useState("90");
  
  const [dashboardRefresh, setDashboardRefresh] = useState("60");
  const [darkMode, setDarkMode] = useState(false);
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>
      
      <Tabs defaultValue="collection">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="collection">
            <Clock className="mr-2 h-4 w-4" /> Collection Settings
          </TabsTrigger>
          <TabsTrigger value="storage">
            <Database className="mr-2 h-4 w-4" /> Storage Settings
          </TabsTrigger>
          <TabsTrigger value="interface">
            <Shield className="mr-2 h-4 w-4" /> Interface Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="collection" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Telemetry Collection</CardTitle>
              <CardDescription>
                Configure how often telemetry data is collected from endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="collection-interval">Collection Interval (Days)</Label>
                    <span className="text-sm text-muted-foreground">{collectionInterval} day(s)</span>
                  </div>
                  <div className="pt-2">
                    <Slider
                      id="collection-interval"
                      min={1}
                      max={30}
                      step={1}
                      value={[collectionInterval]}
                      onValueChange={(values) => setCollectionInterval(values[0])}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    How frequently telemetry data should be collected from each endpoint.
                    Registry Key: HKLM\SOFTWARE\CircleOfBytes\TracePointAnalytics\CollectionIntervalDays
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Data Collection Types</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="application-logs">Windows Application Event Logs</Label>
                      <p className="text-xs text-muted-foreground">
                        Errors and warnings from the Application event log
                      </p>
                    </div>
                    <Switch
                      id="application-logs"
                      checked={applicationLogs}
                      onCheckedChange={setApplicationLogs}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="system-logs">Windows System Event Logs</Label>
                      <p className="text-xs text-muted-foreground">
                        Errors and warnings from the System event log
                      </p>
                    </div>
                    <Switch
                      id="system-logs"
                      checked={systemLogs}
                      onCheckedChange={setSystemLogs}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="bsod-logs">BSOD/Minidump Logs</Label>
                      <p className="text-xs text-muted-foreground">
                        Blue Screen of Death events and crash minidumps
                      </p>
                    </div>
                    <Switch
                      id="bsod-logs"
                      checked={bsodLogs}
                      onCheckedChange={setBsodLogs}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" /> Save Collection Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="storage" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Configuration</CardTitle>
              <CardDescription>
                Manage where and how long telemetry data is stored
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storage-path">Azure Blob Storage Path</Label>
                <Input
                  id="storage-path"
                  value={storagePath}
                  onChange={(e) => setStoragePath(e.target.value)}
                  placeholder="https://yourstorage.blob.core.windows.net/container"
                />
                <p className="text-xs text-muted-foreground">
                  The URL for the Azure Blob Storage container where telemetry data will be uploaded
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="retention-policy">Data Retention Policy</Label>
                <Select value={retention} onValueChange={setRetention}>
                  <SelectTrigger id="retention-policy">
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">365 days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How long telemetry data will be kept before automatic deletion
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" /> Save Storage Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="interface" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Interface</CardTitle>
              <CardDescription>
                Configure the look and feel of the TracePoint Analytics dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Dashboard Auto-Refresh</Label>
                <Select value={dashboardRefresh} onValueChange={setDashboardRefresh}>
                  <SelectTrigger id="refresh-interval">
                    <SelectValue placeholder="Select refresh interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Manual refresh only</SelectItem>
                    <SelectItem value="30">Every 30 seconds</SelectItem>
                    <SelectItem value="60">Every minute</SelectItem>
                    <SelectItem value="300">Every 5 minutes</SelectItem>
                    <SelectItem value="600">Every 10 minutes</SelectItem>
                    <SelectItem value="3600">Every hour</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How often the dashboard should automatically refresh data
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable dark color scheme for the interface
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              
              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Reset to Default Settings
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" /> Save Interface Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
