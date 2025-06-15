
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Download,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const LANGUAGES: { value: string; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" }
];

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "IST", label: "India Standard Time" },
  { value: "EST", label: "Eastern Time" },
  { value: "PST", label: "Pacific Time" }
];

const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" }
];

const TIME_FORMATS = [
  { value: "12h", label: "12 Hour" },
  { value: "24h", label: "24 Hour" }
];

function setDarkModeEnabled(enabled: boolean) {
  if (enabled) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// Helper to mimic i18n
function translate(str: string, lang: string) {
  if (lang === "hi") {
    // Just a demo; in production use a real i18n solution.
    if (str === "Settings") return "सेटिंग्स";
    if (str === "System Settings") return "सिस्टम सेटिंग्स";
    if (str === "General") return "सामान्य";
    if (str === "Notifications") return "सूचनाएं";
    if (str === "Security") return "सुरक्षा";
    if (str === "System") return "सिस्टम";
    if (str === "Appearance") return "रूप";
    if (str === "Language") return "भाषा";
    if (str === "Timezone") return "समय क्षेत्र";
    if (str === "Date Format") return "तारीख़ प्रारूप";
    if (str === "Time Format") return "समय प्रारूप";
    if (str === "Dark Mode") return "डार्क मोड";
    if (str === "Toggle dark mode theme") return "डार्क मोड थीम चालू/बंद करें";
    if (str === "Create Backup") return "बैकअप बनाएं";
    if (str === "User Management") return "यूज़र प्रबंधन";
    // Add more as needed...
  }
  return str;
}

const SettingsPage = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    timesheet: true,
    projects: true,
    reports: false,
  });

  const [preferences, setPreferences] = useState(() => {
    // On first mount, try to read dark mode pref from localStorage:
    const darkMode = localStorage.getItem("darkMode") === "true";
    const language = localStorage.getItem("language") || "en";
    const timezone = localStorage.getItem("timezone") || "UTC";
    const dateFormat = localStorage.getItem("dateFormat") || "MM/DD/YYYY";
    const timeFormat = localStorage.getItem("timeFormat") || "12h";
    return { darkMode, language, timezone, dateFormat, timeFormat };
  });

  useEffect(() => {
    setDarkModeEnabled(preferences.darkMode);
    localStorage.setItem("darkMode", String(preferences.darkMode));
  }, [preferences.darkMode]);

  useEffect(() => {
    localStorage.setItem("language", preferences.language);
    localStorage.setItem("timezone", preferences.timezone);
    localStorage.setItem("dateFormat", preferences.dateFormat);
    localStorage.setItem("timeFormat", preferences.timeFormat);
  }, [preferences.language, preferences.timezone, preferences.dateFormat, preferences.timeFormat]);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    toast({ title: "Saved", description: `Notification '${key}' preference updated.` });
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    if (key === "language") {
      toast({ title: "Language changed", description: value === "hi" ? "एप अब हिंदी में है।" : "App language set to English." });
    }
    if (key === "darkMode") {
      toast({ title: value ? "Dark Mode Enabled" : "Light Mode Enabled" });
    }
  };

  // Security handlers
  const handlePasswordChange = () => {
    toast({ title: "Change Password Clicked", description: "In production, this would open a dialog." });
  };
  const handle2FA = () => {
    toast({ title: "Two-Factor Auth", description: "In production, this would walk through 2FA setup." });
  };
  const handleManageSessions = () => {
    toast({ title: "Sessions", description: "Here you would list sessions and allow logout of others." });
  };
  const handleViewLoginHistory = () => {
    toast({ title: "Login History", description: "Here you would see login events." });
  };

  // System handlers (admin)
  const handleBackup = () => {
    toast({ title: "Backup Started", description: "A backup of the system would be created." });
  };
  const handleViewLogs = () => {
    toast({ title: "Logs", description: "System logs would be shown here." });
  };
  const handleUserManagement = () => {
    toast({ title: "User Management", description: "You could invite, remove, or manage users here." });
  };
  const handleMaintenance = () => {
    toast({ title: "Maintenance", description: "System maintenance tasks modal would appear." });
  };
  const handleResetSystem = () => {
    toast({ title: "Reset Initiated", description: "System reset (demo, not actually performed)." });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {isAdmin 
            ? translate('System Settings', preferences.language)
            : translate('Settings', preferences.language)}
        </h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">{translate("General", preferences.language)}</TabsTrigger>
          <TabsTrigger value="notifications">{translate("Notifications", preferences.language)}</TabsTrigger>
          <TabsTrigger value="security">{translate("Security", preferences.language)}</TabsTrigger>
          {isAdmin && <TabsTrigger value="system">{translate("System", preferences.language)}</TabsTrigger>}
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                {translate("Appearance", preferences.language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">{translate("Dark Mode", preferences.language)}</Label>
                  <p className="text-sm text-gray-500">{translate("Toggle dark mode theme", preferences.language)}</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={preferences.darkMode}
                  onCheckedChange={(value) => handlePreferenceChange('darkMode', value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                {translate("Localization", preferences.language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{translate("Language", preferences.language)}</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  >
                    {LANGUAGES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>{translate("Timezone", preferences.language)}</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={preferences.timezone}
                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  >
                    {TIMEZONES.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>{translate("Date Format", preferences.language)}</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={preferences.dateFormat}
                    onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                  >
                    {DATE_FORMATS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>{translate("Time Format", preferences.language)}</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={preferences.timeFormat}
                    onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                  >
                    {TIME_FORMATS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(value) => handleNotificationChange('email', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(value) => handleNotificationChange('push', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="timesheet-notifications">Timesheet Reminders</Label>
                    <p className="text-sm text-gray-500">Get reminded to submit timesheets</p>
                  </div>
                  <Switch
                    id="timesheet-notifications"
                    checked={notifications.timesheet}
                    onCheckedChange={(value) => handleNotificationChange('timesheet', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="project-notifications">Project Updates</Label>
                    <p className="text-sm text-gray-500">Notifications about project changes</p>
                  </div>
                  <Switch
                    id="project-notifications"
                    checked={notifications.projects}
                    onCheckedChange={(value) => handleNotificationChange('projects', value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="report-notifications">Report Generation</Label>
                    <p className="text-sm text-gray-500">Notifications when reports are ready</p>
                  </div>
                  <Switch
                    id="report-notifications"
                    checked={notifications.reports}
                    onCheckedChange={(value) => handleNotificationChange('reports', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" onClick={handlePasswordChange}>Change Password</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Not enabled</p>
                  </div>
                  <Button variant="outline" onClick={handle2FA}>Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Active Sessions</h4>
                    <p className="text-sm text-gray-500">1 active session</p>
                  </div>
                  <Button variant="outline" onClick={handleManageSessions}>Manage Sessions</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Login History</h4>
                    <p className="text-sm text-gray-500">View recent login activity</p>
                  </div>
                  <Button variant="outline" onClick={handleViewLoginHistory}>View History</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  System Administration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Backup Data</h4>
                      <p className="text-sm text-gray-500">Create a backup of all system data</p>
                    </div>
                    <Button variant="outline" onClick={handleBackup}>
                      <Download className="w-4 h-4 mr-2" />
                      Create Backup
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">System Logs</h4>
                      <p className="text-sm text-gray-500">View and download system logs</p>
                    </div>
                    <Button variant="outline" onClick={handleViewLogs}>View Logs</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">User Management</h4>
                      <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
                    </div>
                    <Button variant="outline" onClick={handleUserManagement}>Manage Users</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">System Maintenance</h4>
                      <p className="text-sm text-gray-500">Perform maintenance tasks</p>
                    </div>
                    <Button variant="outline" onClick={handleMaintenance}>Maintenance</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-800">Reset System</h4>
                      <p className="text-sm text-red-600">This will reset all system data and cannot be undone</p>
                    </div>
                    <Button variant="destructive" onClick={handleResetSystem}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reset System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SettingsPage;

