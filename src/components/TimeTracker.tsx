
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LogOut, Calendar as CalendarIcon, Clock, Users, FileText, Settings, BarChart3, AlertTriangle } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from "date-fns";
import { cn } from "@/lib/utils";
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
} from "@/components/ui/sidebar";

interface TimeTrackerProps {
  userRole: "Employee" | "Admin" | null;
  onLogout: () => void;
}

const TimeTracker = ({ userRole, onLogout }: TimeTrackerProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState({
    Website: { sun: "", mon: "", tue: "", wed: "", thu: "", fri: "", sat: "" },
    "Web Page": { sun: "", mon: "", tue: "", wed: "", thu: "", fri: "", sat: "" },
    "Leave/Holiday": { sun: "", mon: "", tue: "", wed: "", thu: "", fri: "", sat: "" }
  });
  const [comment, setComment] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    return {
      key: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][i],
      label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
      date: format(day, "MMM d"),
      fullDate: day
    };
  });

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
    const numValue = parseFloat(value) || 0;
    const newErrors = { ...validationErrors };
    
    // Clear previous errors for this field
    delete newErrors[`${project}-${day}`];
    delete newErrors[`day-${day}`];
    delete newErrors["week"];

    // Validate daily limit (8 hours max per day)
    if (numValue > 8) {
      newErrors[`${project}-${day}`] = "Maximum 8 hours per day";
      setValidationErrors(newErrors);
      return;
    }

    const updatedEntries = {
      ...timeEntries,
      [project]: {
        ...timeEntries[project as keyof typeof timeEntries],
        [day]: value
      }
    };

    // Calculate new day total
    const dayTotal = Object.keys(updatedEntries).reduce((total, proj) => {
      if (proj === "Leave/Holiday") return total;
      const hours = parseFloat(updatedEntries[proj as keyof typeof updatedEntries][day as keyof typeof updatedEntries.Website]) || 0;
      return total + hours;
    }, 0);

    // Check if Leave/Holiday is selected for this day
    const isLeaveDay = parseFloat(updatedEntries["Leave/Holiday"][day as keyof typeof updatedEntries.Website]) > 0;

    if (!isLeaveDay && dayTotal > 8) {
      newErrors[`day-${day}`] = "Total daily hours cannot exceed 8";
    }

    // Calculate weekly total
    const weekTotal = calculateWeeklyTotal(updatedEntries);
    if (weekTotal > 40) {
      newErrors["week"] = "Total weekly hours cannot exceed 40";
    }

    setValidationErrors(newErrors);
    setTimeEntries(updatedEntries);
  };

  const calculateDayTotal = (day: string) => {
    const isLeaveDay = parseFloat(timeEntries["Leave/Holiday"][day as keyof typeof timeEntries.Website]) > 0;
    if (isLeaveDay) return "Leave";
    
    return Object.keys(timeEntries).reduce((total, project) => {
      if (project === "Leave/Holiday") return total;
      const hours = parseFloat(timeEntries[project as keyof typeof timeEntries][day as keyof typeof timeEntries.Website]) || 0;
      return total + hours;
    }, 0).toFixed(2);
  };

  const calculateProjectTotal = (project: string) => {
    return Object.values(timeEntries[project as keyof typeof timeEntries]).reduce((total, hours) => {
      return total + (parseFloat(hours as string) || 0);
    }, 0).toFixed(2);
  };

  const calculateWeeklyTotal = (entries = timeEntries) => {
    return Object.keys(entries).reduce((total, project) => {
      if (project === "Leave/Holiday") return total;
      return total + parseFloat(calculateProjectTotal(project));
    }, 0);
  };

  const calculateGrandTotal = () => {
    return calculateWeeklyTotal().toFixed(2);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1));
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentWeek(date);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(validationErrors).length > 0) {
      alert("Please fix validation errors before submitting.");
      return;
    }
    console.log("Submitting timesheet:", { timeEntries, comment, week: format(weekStart, "yyyy-MM-dd") });
    alert("Timesheet submitted successfully!");
  };

  const handleSave = () => {
    console.log("Saving timesheet:", { timeEntries, comment, week: format(weekStart, "yyyy-MM-dd") });
    alert("Timesheet saved successfully!");
  };

  const weeklyTotal = calculateWeeklyTotal();
  const isOverWeeklyLimit = weeklyTotal > 40;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Hover trigger area */}
        <div 
          className="fixed left-0 top-0 w-4 h-full z-50 bg-transparent"
          onMouseEnter={() => setSidebarOpen(true)}
        />

        {/* Sidebar with hover behavior */}
        <div 
          className={`fixed left-0 top-0 h-full z-40 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onMouseLeave={() => setSidebarOpen(false)}
        >
          <Sidebar className="w-64 h-full">
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
        </div>

        {/* Small visible edge when sidebar is hidden */}
        <div 
          className={`fixed left-0 top-1/2 transform -translate-y-1/2 w-1 h-20 bg-blue-500 rounded-r-md z-30 transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />

        <main className="flex-1">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
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
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        {format(weekStart, "dd/MM/yyyy")} - {format(weekEnd, "dd/MM/yyyy")}
                      </h2>
                    </div>
                    
                    {/* Week Navigation */}
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigateWeek('prev')}
                      >
                        ← Previous
                      </Button>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Select Week
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={currentWeek}
                            onSelect={handleCalendarSelect}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigateWeek('next')}
                      >
                        Next →
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      {format(currentWeek, "yyyy")} - Week {format(currentWeek, "w")}
                    </div>
                    {isOverWeeklyLimit && (
                      <div className="flex items-center text-red-600 text-sm">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Over 40h limit
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Validation Errors */}
                {Object.keys(validationErrors).length > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
                    <div className="flex">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Validation Errors:</h3>
                        <div className="mt-2 text-sm text-red-700">
                          {Object.values(validationErrors).map((error, index) => (
                            <div key={index}>• {error}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                          <td className={`p-4 font-medium border-r ${
                            project === "Leave/Holiday" ? "text-orange-600" : "text-gray-900"
                          }`}>
                            {project}
                          </td>
                          {weekDays.map((day) => {
                            const isLeaveProject = project === "Leave/Holiday";
                            const isLeaveDay = parseFloat(timeEntries["Leave/Holiday"][day.key as keyof typeof timeEntries.Website]) > 0;
                            const isDisabled = !isLeaveProject && isLeaveDay;
                            
                            return (
                              <td key={day.key} className="p-2 border-r">
                                <Input
                                  type={isLeaveProject ? "checkbox" : "number"}
                                  step={isLeaveProject ? undefined : "0.5"}
                                  min={isLeaveProject ? undefined : "0"}
                                  max={isLeaveProject ? undefined : "8"}
                                  value={isLeaveProject ? undefined : timeEntries[project as keyof typeof timeEntries][day.key as keyof typeof timeEntries.Website]}
                                  checked={isLeaveProject ? parseFloat(timeEntries[project as keyof typeof timeEntries][day.key as keyof typeof timeEntries.Website]) > 0 : undefined}
                                  onChange={(e) => {
                                    if (isLeaveProject) {
                                      handleTimeChange(project, day.key, e.target.checked ? "8" : "0");
                                    } else {
                                      handleTimeChange(project, day.key, e.target.value);
                                    }
                                  }}
                                  disabled={isDisabled}
                                  className={cn(
                                    "w-full text-center border-gray-300",
                                    isLeaveProject && "w-5 h-5 mx-auto",
                                    isDisabled && "bg-gray-100 cursor-not-allowed",
                                    validationErrors[`${project}-${day.key}`] && "border-red-500"
                                  )}
                                  placeholder={isLeaveProject ? undefined : "0.00"}
                                />
                              </td>
                            );
                          })}
                          <td className="p-4 text-center font-medium text-gray-900">
                            {project === "Leave/Holiday" ? 
                              `${Object.values(timeEntries[project]).filter(v => parseFloat(v as string) > 0).length} days` :
                              calculateProjectTotal(project)
                            }
                          </td>
                        </tr>
                      ))}
                      
                      {/* Total Hours Row */}
                      <tr className={`border-t-2 ${isOverWeeklyLimit ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                        <td className="p-4 font-bold text-gray-900 border-r">TOTAL HOURS</td>
                        {weekDays.map((day) => (
                          <td key={day.key} className={`p-4 text-center font-bold border-r ${
                            validationErrors[`day-${day.key}`] ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {calculateDayTotal(day.key)}
                          </td>
                        ))}
                        <td className={`p-4 text-center font-bold ${
                          isOverWeeklyLimit ? 'text-red-600' : 'text-gray-900'
                        }`}>
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
                      disabled={Object.keys(validationErrors).length > 0}
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
