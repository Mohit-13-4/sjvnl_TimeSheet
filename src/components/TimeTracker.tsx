
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface TimeEntry {
  id: string;
  task_name: string;
  hours: number;
  entry_date: string;
  project_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  week_start: string;
  is_leave: boolean;
}

interface Project {
  id: string;
  name: string;
  allocated_hours: number;
}

interface TimeTrackerProps {
  userRole: string;
  onLogout: () => void;
}

const TimeTracker = ({ userRole, onLogout }: TimeTrackerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newEntry, setNewEntry] = useState({
    task_name: "",
    hours: "",
    entry_date: new Date().toISOString().split('T')[0],
    project_id: "",
    is_leave: false
  });

  // Calculate week start (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };

  const fetchTimeEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching time entries:', error);
    } else {
      // Type assertion to ensure status compatibility
      const typedEntries = data.map(entry => ({
        ...entry,
        status: entry.status as 'pending' | 'approved' | 'rejected'
      }));
      setTimeEntries(typedEntries);
    }
  };

  const fetchProjects = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('id, name, allocated_hours')
      .eq('assigned_to', user.id);

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
  };

  useEffect(() => {
    fetchTimeEntries();
    fetchProjects();
  }, [user]);

  const addTimeEntry = async () => {
    if (!user || !newEntry.task_name || !newEntry.hours) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const entryDate = new Date(newEntry.entry_date);
    const weekStart = getWeekStart(entryDate);

    const { error } = await supabase
      .from('time_entries')
      .insert({
        user_id: user.id,
        task_name: newEntry.task_name,
        hours: parseFloat(newEntry.hours),
        entry_date: newEntry.entry_date,
        project_id: newEntry.project_id === "none" ? null : newEntry.project_id,
        week_start: weekStart,
        is_leave: newEntry.is_leave,
        status: 'pending'
      });

    if (error) {
      console.error('Error adding time entry:', error);
      toast({
        title: "Error",
        description: "Failed to add time entry",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Time entry added successfully"
      });
      setNewEntry({
        task_name: "",
        hours: "",
        entry_date: new Date().toISOString().split('T')[0],
        project_id: "",
        is_leave: false
      });
      fetchTimeEntries();
    }
  };

  const getTotalHours = () => {
    return timeEntries.reduce((total, entry) => total + entry.hours, 0);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Time Tracker</h1>
        <p className="text-gray-600">Track your daily work hours and tasks</p>
      </div>

      {/* Add New Entry */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Time Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="task">Task Name</Label>
              <Input
                id="task"
                value={newEntry.task_name}
                onChange={(e) => setNewEntry(prev => ({ ...prev, task_name: e.target.value }))}
                placeholder="Enter task description"
              />
            </div>
            
            <div>
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
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newEntry.entry_date}
                onChange={(e) => setNewEntry(prev => ({ ...prev, entry_date: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="project">Project</Label>
              <Select 
                value={newEntry.project_id} 
                onValueChange={(value) => setNewEntry(prev => ({ ...prev, project_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={addTimeEntry} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-blue-600">{getTotalHours()}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-green-600">
                  {timeEntries
                    .filter(entry => {
                      const today = new Date();
                      const weekStart = getWeekStart(today);
                      return entry.week_start === weekStart;
                    })
                    .reduce((total, entry) => total + entry.hours, 0)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projects</p>
                <p className="text-2xl font-bold text-purple-600">{projects.length}</p>
              </div>
              <Plus className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No time entries yet. Add your first entry above!</p>
            ) : (
              timeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{entry.task_name}</h3>
                    <p className="text-sm text-gray-500">
                      {entry.entry_date} • {entry.hours} hours
                      {entry.project_id && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {projects.find(p => p.id === entry.project_id)?.name || 'Unknown Project'}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                      entry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTracker;
