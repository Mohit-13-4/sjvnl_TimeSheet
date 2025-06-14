
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  ClipboardList, 
  Clock, 
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalEmployees: number;
  activeProjects: number;
  pendingTimeEntries: number;
  thisWeekHours: number;
  completedProjects: number;
  overdueProjects: number;
}

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const Dashboard = ({ onViewChange }: DashboardProps) => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeProjects: 0,
    pendingTimeEntries: 0,
    thisWeekHours: 0,
    completedProjects: 0,
    overdueProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [profile?.role]);

  const fetchDashboardStats = async () => {
    try {
      const promises = [];

      // Get total employees (for admins)
      if (profile?.role === 'admin' || profile?.role === 'super_admin') {
        promises.push(
          supabase
            .from('profiles')
            .select('id', { count: 'exact' })
            .eq('role', 'employee')
        );
      }

      // Get active projects
      promises.push(
        supabase
          .from('projects')
          .select('id', { count: 'exact' })
          .eq('status', 'active')
      );

      // Get pending time entries
      promises.push(
        supabase
          .from('time_entries')
          .select('id', { count: 'exact' })
          .eq('status', 'pending')
      );

      // Get completed projects
      promises.push(
        supabase
          .from('projects')
          .select('id', { count: 'exact' })
          .eq('status', 'completed')
      );

      // Get this week's hours for current user
      const startOfWeek = getStartOfWeek();
      promises.push(
        supabase
          .from('time_entries')
          .select('hours')
          .eq('user_id', profile?.id)
          .gte('entry_date', startOfWeek.toISOString().split('T')[0])
      );

      const results = await Promise.all(promises);
      
      let statsIndex = 0;
      const newStats: DashboardStats = {
        totalEmployees: 0,
        activeProjects: 0,
        pendingTimeEntries: 0,
        thisWeekHours: 0,
        completedProjects: 0,
        overdueProjects: 0
      };

      if (profile?.role === 'admin' || profile?.role === 'super_admin') {
        newStats.totalEmployees = results[statsIndex]?.count || 0;
        statsIndex++;
      }

      newStats.activeProjects = results[statsIndex]?.count || 0;
      statsIndex++;
      
      newStats.pendingTimeEntries = results[statsIndex]?.count || 0;
      statsIndex++;
      
      newStats.completedProjects = results[statsIndex]?.count || 0;
      statsIndex++;

      // Calculate this week's hours
      const timeEntries = results[statsIndex]?.data || [];
      newStats.thisWeekHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
    return new Date(now.setDate(diff));
  };

  const renderEmployeeDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Active Projects</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeekHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Hours logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Entries</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTimeEntries}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onViewChange('timesheet')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Log Time Entry
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onViewChange('projects')}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              View My Projects
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onViewChange('reports')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Recent time entries and project updates will appear here.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTimeEntries}</div>
            <p className="text-xs text-muted-foreground">Require review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onViewChange('admin-dashboard')}
            >
              <Users className="mr-2 h-4 w-4" />
              Assign Tasks to Employees
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onViewChange('employees')}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Employees
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onViewChange('projects')}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              View All Projects
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onViewChange('reports')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Projects on track:</span>
                <span className="text-green-600">{stats.completedProjects}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending reviews:</span>
                <span className="text-yellow-600">{stats.pendingTimeEntries}</span>
              </div>
              <div className="flex justify-between">
                <span>Active workforce:</span>
                <span className="text-blue-600">{stats.totalEmployees}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Debug information
  console.log('Dashboard rendering - Profile role:', profile?.role);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {profile?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
        </h2>
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Show role debug info temporarily */}
      {!profile?.role && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Debug:</strong> Profile role is not loaded. Role: {profile?.role || 'undefined'}
        </div>
      )}

      {profile?.role === 'admin' ? renderAdminDashboard() : renderEmployeeDashboard()}
    </div>
  );
};

export default Dashboard;
