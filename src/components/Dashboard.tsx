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
}

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const Dashboard = ({ onViewChange }: { onViewChange: (v: string) => void }) => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeProjects: 0,
    pendingTimeEntries: 0,
    thisWeekHours: 0,
    completedProjects: 0
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  useEffect(() => {
    if (profile) {
      fetchDashboardStats();
    }
  }, [profile]);

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats for profile:', profile);
      
      // Get active projects count
      const { count: activeProjectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get completed projects count
      const { count: completedProjectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get pending time entries count
      const { count: pendingEntriesCount } = await supabase
        .from('time_entries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get this week's hours for current user
      const startOfWeek = getStartOfWeek();
      const { data: timeEntries } = await supabase
        .from('time_entries')
        .select('hours')
        .eq('user_id', profile?.id)
        .gte('entry_date', startOfWeek.toISOString().split('T')[0]);

      const thisWeekHours = timeEntries?.reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0;

      let totalEmployees = 0;
      if (isAdmin) {
        const { count: employeeCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        totalEmployees = employeeCount || 0;
      }

      setStats({
        totalEmployees,
        activeProjects: activeProjectsCount || 0,
        pendingTimeEntries: pendingEntriesCount || 0,
        thisWeekHours,
        completedProjects: completedProjectsCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
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

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-gray-500">Please log in to view your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-8">
      <div className="relative bg-gradient-to-r from-primary to-secondary shadow-inner rounded-lg flex flex-col md:flex-row items-center p-6 md:space-x-8 mb-8 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80"
          alt="Work hero"
          className="w-32 h-32 rounded-lg object-cover mb-4 md:mb-0 md:mr-8 border-4 border-background shadow-lg"
        />
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-background drop-shadow-sm mb-2">Welcome to Your Dashboard</h2>
          <p className="text-lg text-background/80">
            Keep track of your work, projects and more — all in one place.
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {isAdmin ? 'Admin Dashboard' : 'Employee Dashboard'}
        </h2>
        <div className="text-sm text-muted-foreground">
          Welcome, {profile.full_name}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin && (
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
        )}

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
              View Projects
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
    </div>
  );
};

export default Dashboard;
