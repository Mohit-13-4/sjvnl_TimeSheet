
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Calendar, Trash2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Project {
  id: string;
  name: string;
  allocated_hours: number;
}

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  day: string;
  hours: number;
  isLeave?: boolean;
  leaveType?: 'half-day' | 'full-day';
}

const WeeklyTimesheet = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [comment, setComment] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; // Working days only

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
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

  // Check if day is weekend
  const isWeekend = (day: string) => {
    return day === 'Sat' || day === 'Sun';
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

  // Add new time entry
  const addTimeEntry = (projectId: string, day: string) => {
    if (isWeekend(day)) {
      toast({
        title: "Weekend Entry Not Allowed",
        description: "Cannot add entries for weekends",
        variant: "destructive"
      });
      return;
    }

    const project = projects.find(p => p.id === projectId);
    if (!project && projectId !== 'leave') return;

    const newEntry: TimeEntry = {
      id: `${projectId}-${day}-${Date.now()}`,
      projectId,
      projectName: project ? project.name : 'Leave',
      day,
      hours: 0,
      isLeave: projectId === 'leave'
    };

    setTimeEntries(prev => [...prev, newEntry]);
  };

  // Add leave entry
  const addLeaveEntry = (day: string, leaveType: 'half-day' | 'full-day') => {
    if (isWeekend(day)) {
      toast({
        title: "Weekend Entry Not Allowed",
        description: "Cannot add entries for weekends",
        variant: "destructive"
      });
      return;
    }

    const newEntry: TimeEntry = {
      id: `leave-${day}-${Date.now()}`,
      projectId: 'leave',
      projectName: `Leave (${leaveType})`,
      day,
      hours: leaveType === 'full-day' ? 8 : 4,
      isLeave: true,
      leaveType
    };

    setTimeEntries(prev => [...prev, newEntry]);
  };

  // Update hours for an entry
  const updateHours = (entryId: string, hours: string) => {
    const numericHours = parseFloat(hours) || 0;
    
    setTimeEntries(prev => prev.map(entry => 
      entry.id === entryId ? { ...entry, hours: numericHours } : entry
    ));
  };

  // Remove time entry
  const removeTimeEntry = (entryId: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  // Calculate daily totals
  const getDayTotal = (day: string) => {
    return timeEntries
      .filter(entry => entry.day === day)
      .reduce((total, entry) => total + entry.hours, 0);
  };

  // Calculate weekly total
  const getWeeklyTotal = () => {
    return timeEntries.reduce((total, entry) => total + entry.hours, 0);
  };

  // Get weekly target (40 hours for working days)
  const getWeeklyTarget = () => {
    return 40; // 5 working days * 8 hours
  };

  // Check if form can be submitted
  const canSubmit = () => {
    const weeklyTotal = getWeeklyTotal();
    const target = getWeeklyTarget();
    return weeklyTotal >= target;
  };

  // Get entries for a specific day
  const getDayEntries = (day: string) => {
    return timeEntries.filter(entry => entry.day === day);
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
    if (!canSubmit()) {
      toast({
        title: "Cannot Submit",
        description: `Weekly target of ${getWeeklyTarget()} hours not met. Current total: ${getWeeklyTotal().toFixed(1)} hours`,
        variant: "destructive"
      });
      return;
    }

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
              <span className="font-medium">Working Days:</span> Monday to Friday (Weekends are frozen)
            </div>
            <div className="text-blue-700">
              <span className="font-medium">Weekly Target:</span> {getWeeklyTarget()} hours
            </div>
            <div className="text-blue-700">
              <span className="font-medium">Current Total:</span> {getWeeklyTotal().toFixed(1)} hours
              {!canSubmit() && <span className="text-red-600 ml-2">(Target not met)</span>}
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
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Add Entry Section */}
                {!isAdmin && (
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-4">Add Time Entry</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {weekDays.map((day) => (
                        <div key={day} className="space-y-2">
                          <label className="text-sm font-medium">{day}</label>
                          <div className="space-y-2">
                            <Select onValueChange={(value) => {
                              if (value.startsWith('leave-')) {
                                const leaveType = value.split('-')[1] as 'half-day' | 'full-day';
                                addLeaveEntry(day, leaveType);
                              } else {
                                addTimeEntry(value, day);
                              }
                            }}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select project/leave" />
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map((project) => (
                                  <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                  </SelectItem>
                                ))}
                                <SelectItem value="leave-half-day">Leave (Half Day)</SelectItem>
                                <SelectItem value="leave-full-day">Leave (Full Day)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Entries Display */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-4 font-medium">ENTRY</th>
                        {daysOfWeek.map((day, index) => (
                          <th key={index} className={`text-center p-4 font-medium min-w-[120px] ${isWeekend(day) ? 'bg-gray-200 text-gray-500' : ''}`}>
                            <div>{day}</div>
                            <div className="text-sm text-gray-500 font-normal">
                              {weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            {isWeekend(day) && <div className="text-xs text-gray-400">FROZEN</div>}
                          </th>
                        ))}
                        <th className="text-center p-4 font-medium">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daysOfWeek.map((day) => {
                        const dayEntries = getDayEntries(day);
                        return dayEntries.map((entry) => (
                          <tr key={entry.id} className="border-b">
                            <td className="p-4 font-medium">{entry.projectName}</td>
                            {daysOfWeek.map((d) => (
                              <td key={d} className={`p-2 ${isWeekend(d) ? 'bg-gray-100' : ''}`}>
                                {d === day ? (
                                  entry.isLeave ? (
                                    <div className="text-center p-2 bg-orange-100 text-orange-700 rounded">
                                      {entry.hours}h ({entry.leaveType})
                                    </div>
                                  ) : isAdmin ? (
                                    <div className="text-center p-2 text-gray-400 italic">
                                      View Only
                                    </div>
                                  ) : (
                                    <Input
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      value={entry.hours || ''}
                                      onChange={(e) => updateHours(entry.id, e.target.value)}
                                      className="text-center"
                                      placeholder="0.00"
                                    />
                                  )
                                ) : (
                                  <div className={`text-center p-2 ${isWeekend(d) ? 'text-gray-400' : ''}`}>
                                    {isWeekend(d) ? 'FROZEN' : '-'}
                                  </div>
                                )}
                              </td>
                            ))}
                            <td className="p-4 text-center">
                              {!isAdmin && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => removeTimeEntry(entry.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ));
                      })}

                      {/* Daily Totals Row */}
                      <tr className="border-b bg-gray-50 font-bold">
                        <td className="p-4">DAILY TOTALS</td>
                        {daysOfWeek.map((day) => (
                          <td key={day} className={`p-4 text-center ${isWeekend(day) ? 'bg-gray-200 text-gray-500' : ''}`}>
                            {isWeekend(day) ? 'FROZEN' : getDayTotal(day).toFixed(1)}
                          </td>
                        ))}
                        <td className="p-4 text-center">
                          {getWeeklyTotal().toFixed(1)}h
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comment Section */}
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

          {/* Action Buttons - Only show for non-admin users */}
          {!isAdmin && (
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleSave}>
                Save
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!canSubmit()}
                className={!canSubmit() ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Submit
                {!canSubmit() && ` (${(getWeeklyTarget() - getWeeklyTotal()).toFixed(1)}h needed)`}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WeeklyTimesheet;
