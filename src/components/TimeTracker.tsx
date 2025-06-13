import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LogOut, Calendar, Clock, Users, FileText, Settings, BarChart3 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface TimeTrackerProps {
  userRole: "Employee" | "Admin" | null;
  onLogout: () => void;
}

const TimeTracker = ({ userRole, onLogout }: TimeTrackerProps) => {
  const [timeEntries, setTimeEntries] = useState({
    Website: { sun: "", mon: "", tue: "", wed: "", thu: "", fri: "", sat: "" },
    "web page": { sun: "", mon: "", tue: "", wed: "", thu: "", fri: "", sat: "" }
  });
  const [comment, setComment] = useState("");

  const weekDays = [
    { key: "sun", label: "Sun", date: "Jun 8" },
    { key: "mon", label: "Mon", date: "Jun 9" },
    { key: "tue", label: "Tue", date: "Jun 10" },
    { key: "wed", label: "Wed", date: "Jun 11" },
    { key: "thu", label: "Thu", date: "Jun 12" },
    { key: "fri", label: "Fri", date: "Jun 13" },
    { key: "sat", label: "Sat", date: "Jun 14" }
  ];

  // Menu items for the sidebar
  const menuItems = [
    {
      title: "Timesheet",
      url: "#",
      icon: Clock,
    },
    {
      title: "Reports",
      url: "#",
      icon: BarChart3,
    },
    {
      title: "Projects",
      url: "#",
      icon: FileText,
    },
    ...(userRole === "Admin" ? [
      {
        title: "Team",
        url: "#",
        icon: Users,
      }
    ] : []),
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ];

  const handleTimeChange = (project: string, day: string, value: string) => {
    setTimeEntries(prev => ({
      ...prev,
      [project]: {
        ...prev[project as keyof typeof prev],
        [day]: value
      }
    }));
  };

  const calculateDayTotal = (day: string) => {
    return Object.keys(timeEntries).reduce((total, project) => {
      const hours = parseFloat(timeEntries[project as keyof typeof timeEntries][day as keyof typeof timeEntries.Website]) || 0;
      return total + hours;
    }, 0).toFixed(2);
  };

  const calculateProjectTotal = (project: string) => {
    return Object.values(timeEntries[project as keyof typeof timeEntries]).reduce((total, hours) => {
      return total + (parseFloat(hours as string) || 0);
    }, 0).toFixed(2);
  };

  const calculateGrandTotal = () => {
    return Object.keys(timeEntries).reduce((total, project) => {
      return total + parseFloat(calculateProjectTotal(project));
    }, 0).toFixed(2);
  };

  const handleSubmit = () => {
    console.log("Submitting timesheet:", { timeEntries, comment });
    alert("Timesheet submitted successfully!");
  };

  const handleSave = () => {
    console.log("Saving timesheet:", { timeEntries, comment });
    alert("Timesheet saved successfully!");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <div className="text-white font-bold text-xs">SJVN</div>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">TimeTracker</h2>
                <p className="text-xs text-gray-600">{userRole}</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger />
                  <h1 className="text-xl font-semibold text-gray-900">Timesheet</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Welcome, {userRole}</span>
                  <Button variant="outline" size="sm" onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Card className="shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">08/06/2025 - 14/06/2025</h2>
                  </div>
                  <div className="text-sm text-gray-600">2025 - 24th</div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Time Entry Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left p-4 font-medium text-gray-900 border-r">PROJECTS/TASKS</th>
                        {weekDays.map((day) => (
                          <th key={day.key} className="text-center p-4 font-medium text-gray-900 border-r min-w-[120px]">
                            <div>{day.label}</div>
                            <div className="text-xs text-gray-500 font-normal">{day.date}</div>
                          </th>
                        ))}
                        <th className="text-center p-4 font-medium text-gray-900">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(timeEntries).map((project, index) => (
                        <tr key={project} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="p-4 font-medium text-gray-900 border-r">{project}</td>
                          {weekDays.map((day) => (
                            <td key={day.key} className="p-2 border-r">
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                max="24"
                                value={timeEntries[project as keyof typeof timeEntries][day.key as keyof typeof timeEntries.Website]}
                                onChange={(e) => handleTimeChange(project, day.key, e.target.value)}
                                className="w-full text-center border-gray-300"
                                placeholder="0.00"
                              />
                            </td>
                          ))}
                          <td className="p-4 text-center font-medium text-gray-900">
                            {calculateProjectTotal(project)}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Total Hours Row */}
                      <tr className="bg-blue-50 border-t-2 border-blue-200">
                        <td className="p-4 font-bold text-gray-900 border-r">TOTAL HOURS</td>
                        {weekDays.map((day) => (
                          <td key={day.key} className="p-4 text-center font-bold text-gray-900 border-r">
                            {calculateDayTotal(day.key)}
                          </td>
                        ))}
                        <td className="p-4 text-center font-bold text-gray-900">
                          {calculateGrandTotal()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Comment Section */}
                <div className="p-6 border-t bg-gray-50">
                  <div className="space-y-2">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                      Comment:
                    </label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Please enter the comments"
                      className="w-full h-24 resize-none"
                      maxLength={255}
                    />
                    <div className="text-right text-xs text-gray-500">
                      {comment.length} / 255
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-4">
                    <Button 
                      onClick={handleSave}
                      variant="outline"
                      className="px-6"
                    >
                      Save
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      className="px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TimeTracker;
