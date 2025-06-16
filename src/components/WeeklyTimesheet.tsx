import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  name: string;
  allocated_hours: number;
}

interface WeeklyHours {
  [projectId: string]: {
    [day: string]: number;
  };
}

interface LeaveStatus {
  [day: string]: boolean;
}

const WeeklyTimesheet = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>({});
  const [leaveStatus, setLeaveStatus] = useState<LeaveStatus>({});
  const [comment, setComment] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  // Fetch projects assigned to the current user
  useEffect(() => {
    const fetchAssignedProjects = async () => {
      if (!profile?.id || isAdmin) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, allocated_hours')
          .eq('assigned_to', profile.id)
          .eq('status', 'active');

        if (error) {
          console.error('Error fetching projects:', error);
          toast({
            title: "Error",
            description: "Failed to fetch assigned projects",
            variant: "destructive"
          });
        } else {
          setProjects(data || []);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to fetch assigned projects",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedProjects();
  }, [profile, isAdmin, toast]);

  // Get the start of the week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    d.setDate(diff);
    return d;
  };

  // Get week dates starting from Monday
  const getWeekDates = () => {
    const weekStart = getWeekStart(currentWeek);
    return daysOfWeek.map((_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return date;
    });
  };

  // Format date range
  const getWeekRange = () => {
    const dates = getWeekDates();
    const start = dates[0];
    const end = dates[6];
    return `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')}/${start.getFullYear()} - ${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1).toString().padStart(2, '0')}/${end.getFullYear()}`;
  };

  // Get week number
  const getWeekNumber = () => {
    const d = new Date(currentWeek);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  // Navigate weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  // Handle week selection from calendar
  const handleWeekSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentWeek(date);
      setShowCalendar(false);
    }
  };

  // Update hours for a project and day with 8-hour daily limit
  const updateHours = (projectId: string, day: string, hours: string) => {
    const numericHours = parseFloat(hours) || 0;
    
    // Calculate current total for the day excluding this project
    const currentDayTotal = projects.reduce((total, project) => {
      if (project.id === projectId) return total;
      return total + (weeklyHours[project.id]?.[day] || 0);
    }, 0);
    
    // Check if adding these hours would exceed 8 hours per day
    const newTotal = currentDayTotal + numericHours;
    if (newTotal > 8) {
      toast({
        title: "Daily Limit Exceeded",
        description: `Cannot exceed 8 hours per day. Current total: ${currentDayTotal.toFixed(1)} hours. Maximum you can add: ${(8 - currentDayTotal).toFixed(1)} hours.`,
        variant: "destructive"
      });
      return;
    }
    
    setWeeklyHours(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [day]: numericHours
      }
    }));
  };

  // Toggle leave status
  const toggleLeave = (day: string) => {
    const newLeaveStatus = !leaveStatus[day];
    
    setLeaveStatus(prev => ({
      ...prev,
      [day]: newLeaveStatus
    }));

    // If marking as leave, clear all hours for that day
    if (newLeaveStatus) {
      setWeeklyHours(prev => {
        const updated = { ...prev };
        projects.forEach(project => {
          if (updated[project.id]) {
            updated[project.id] = {
              ...updated[project.id],
              [day]: 0
            };
          }
        });
        return updated;
      });
    }
  };

  // Calculate daily totals
  const getDayTotal = (day: string) => {
    return projects.reduce((total, project) => {
      return total + (weeklyHours[project.id]?.[day] || 0);
    }, 0);
  };

  // Calculate project totals
  const getProjectTotal = (projectId: string) => {
    return daysOfWeek.reduce((total, day) => {
      return total + (weeklyHours[projectId]?.[day] || 0);
    }, 0);
  };

  // Calculate grand total
  const getGrandTotal = () => {
    return projects.reduce((total, project) => {
      return total + getProjectTotal(project.id);
    }, 0);
  };

  // Count leave days
  const getLeaveCount = () => {
    return Object.values(leaveStatus).filter(Boolean).length;
  };

  // Calculate adjusted weekly target based on holidays
  const getWeeklyTarget = () => {
    const leaveCount = getLeaveCount();
    const baseTarget = 40;
    const hoursPerDay = 8;
    
    // Only start reducing hours after 2 holidays
    if (leaveCount <= 2) {
      return baseTarget;
    }
    
    // Reduce hours for holidays beyond the first 2
    const excessHolidays = leaveCount - 2;
    return Math.max(0, baseTarget - (excessHolidays * hoursPerDay));
  };

  // Handle save
  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Timesheet saved as draft"
    });
  };

  // Handle submit
  const handleSubmit = () => {
    toast({
      title: "Submitted",
      description: "Timesheet submitted for approval"
    });
  };

  const weekDates = getWeekDates();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">Timesheet</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold">Timesheet</h1>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Welcome, {profile?.full_name || 'User'}</span>
          <Button variant="ghost" size="sm">
            Logout
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{getWeekRange()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      Select Week
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={currentWeek}
                      onSelect={handleWeekSelect}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {currentWeek.getFullYear()} - Week {getWeekNumber()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours Info */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-blue-700">
              <span className="font-medium">Working Hours:</span> 8 hours per day
            </div>
            <div className="text-blue-700">
              <span className="font-medium">Weekly Target:</span> {getWeeklyTarget()} hours
              {getLeaveCount() > 0 && <span className="text-orange-600 ml-1">({getLeaveCount()} holiday{getLeaveCount() > 1 ? 's' : ''})</span>}
            </div>
            <div className="text-blue-700">
              <span className="font-medium">Current Total:</span> {getGrandTotal().toFixed(2)} hours
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Projects Message */}
      {!isAdmin && projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Projects Assigned
              </h3>
              <p className="text-gray-500">
                No projects have been assigned to you yet. Please contact your administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Timesheet Grid */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 font-medium">PROJECTS/TASKS</th>
                      {weekDates.map((date, index) => (
                        <th key={index} className="text-center p-4 font-medium min-w-[120px]">
                          <div>{daysOfWeek[index]}</div>
                          <div className="text-sm text-gray-500 font-normal">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </th>
                      ))}
                      <th className="text-center p-4 font-medium">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} className="border-b">
                        <td className="p-4 font-medium">{project.name}</td>
                        {daysOfWeek.map((day) => (
                          <td key={day} className="p-2">
                            {isAdmin ? (
                              <div className="text-center p-2 text-gray-400 italic">
                                View Only
                              </div>
                            ) : (
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                max="8"
                                value={weeklyHours[project.id]?.[day] || ''}
                                onChange={(e) => updateHours(project.id, day, e.target.value)}
                                className="text-center"
                                placeholder="0.00"
                                disabled={leaveStatus[day]}
                              />
                            )}
                          </td>
                        ))}
                        <td className="p-4 text-center font-medium">
                          {getProjectTotal(project.id).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Leave/Holiday Row */}
                    {projects.length > 0 && (
                      <tr className="border-b bg-orange-50">
                        <td className="p-4 font-medium text-orange-600">Leave/Holiday</td>
                        {daysOfWeek.map((day) => (
                          <td key={day} className="p-4 text-center">
                            {isAdmin ? (
                              <div className="text-gray-400 italic">View Only</div>
                            ) : (
                              <Checkbox
                                checked={leaveStatus[day] || false}
                                onCheckedChange={() => toggleLeave(day)}
                              />
                            )}
                          </td>
                        ))}
                        <td className="p-4 text-center font-medium text-orange-600">
                          {getLeaveCount()} days
                        </td>
                      </tr>
                    )}

                    {/* Total Hours Row */}
                    {projects.length > 0 && (
                      <tr className="border-b bg-gray-50 font-bold">
                        <td className="p-4">TOTAL HOURS</td>
                        {daysOfWeek.map((day) => (
                          <td key={day} className="p-4 text-center">
                            {getDayTotal(day).toFixed(2)}
                          </td>
                        ))}
                        <td className="p-4 text-center">
                          {getGrandTotal().toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Comment Section */}
          {projects.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comment:</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Please enter the comments"
                    className="min-h-[100px]"
                    maxLength={255}
                    disabled={isAdmin}
                  />
                  <div className="text-right text-sm text-gray-500">
                    {comment.length} / 255
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons - Only show for non-admin users with projects */}
          {!isAdmin && projects.length > 0 && (
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleSave}>
                Save
              </Button>
              <Button onClick={handleSubmit}>
                Submit
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WeeklyTimesheet;
