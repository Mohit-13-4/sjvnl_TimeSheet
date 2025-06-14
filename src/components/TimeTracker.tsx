
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, Save, Plus } from "lucide-react";

interface TimeEntry {
  id: string;
  task_name: string;
  hours: number;
  entry_date: string;
  week_start: string;
  is_leave: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

interface Project {
  id: string;
  name: string;
  allocated_hours: number;
  start_date: string;
  end_date: string;
}

interface TimeTrackerProps {
  userRole: "Employee" | "Admin";
  onLogout: () => void;
}

const TimeTracker = ({ userRole, onLogout }: TimeTrackerProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentWeek, setCurrentWeek] = useState(getStartOfWeek());
  const [newEntry, setNewEntry] = useState({
    task_name: "",
    hours: "",
    project_id: "",
    is_leave: false
  });
  const [loading, setLoading] = useState(true);

  // Get Monday of current week
  function getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function formatDate(date: Date) {
    return date.toISOString().split('T')[0];
  }

  function getWeekDates(startDate: Date) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  useEffect(() => {
    if (profile) {
      fetchTimeEntries();
      fetchProjects();
    }
  }, [profile, currentWeek]);

  const fetchTimeEntries = async () => {
    try {
      const weekStart = formatDate(currentWeek);
      const weekEnd = formatDate(new Date(currentWeek.getTime() + 6 * 24 * 60 * 60 * 1000));

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', profile?.id)
        .gte('entry_date', weekStart)
        .lte('entry_date', weekEnd)
        .order('entry_date', { ascending: true });

      if (error) {
        console.error('Error fetching time entries:', error);
        toast({
          title: "Error",
          description: "Failed to fetch time entries",
          variant: "destructive"
        });
      } else {
        setTimeEntries(data || []);
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('assigned_to', profile?.id)
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.task_name || !newEntry.hours) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('time_entries')
        .insert([{
          user_id: profile?.id,
          project_id: newEntry.project_id || null,
          task_name: newEntry.task_name,
          hours: parseFloat(newEntry.hours),
          entry_date: formatDate(new Date()),
          week_start: formatDate(currentWeek),
          is_leave: newEntry.is_leave
        }]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add time entry",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Time entry added successfully",
        });
        setNewEntry({
          task_name: "",
          hours: "",
          project_id: "",
          is_leave: false
        });
        fetchTimeEntries();
      }
    } catch (error) {
      console.error('Error adding time entry:', error);
    }
  };

  const getWeeklyTotal = () => {
    return timeEntries.reduce((total, entry) => total + entry.hours, 0);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const weekDates = getWeekDates(currentWeek);
  const weeklyTotal = getWeeklyTotal();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Timesheet</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Welcome, {profile?.full_name}
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Week of {currentWeek.toLocaleDateString()}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentWeek(getStartOfWeek())}>
                This Week
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {weekDates.map((date, index) => (
              <div key={index} className="p-2 border rounded">
                <div className="font-medium">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add New Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Time Entry</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task">Task Name</Label>
              <Input
                id="task"
                value={newEntry.task_name}
                onChange={(e) => setNewEntry(prev => ({ ...prev, task_name: e.target.value }))}
                placeholder="Enter task description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={newEntry.hours}
                onChange={(e) => setNewEntry(prev => ({ ...prev, hours: e.target.value }))}
                placeholder="0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select 
                value={newEntry.project_id} 
                onValueChange={(value) => setNewEntry(prev => ({ ...prev, project_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddEntry} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Time Entries</span>
            </CardTitle>
            <div className="text-sm font-medium">
              Total: {weeklyTotal.toFixed(1)} hours
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No time entries for this week. Add your first entry above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.entry_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {entry.is_leave ? (
                        <span className="italic text-orange-600">Leave</span>
                      ) : (
                        entry.task_name
                      )}
                    </TableCell>
                    <TableCell>{entry.hours}</TableCell>
                    <TableCell>
                      <Badge variant={
                        entry.status === 'approved' ? 'default' :
                        entry.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {entry.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTracker;
