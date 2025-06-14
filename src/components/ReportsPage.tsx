
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Download, 
  Calendar,
  Clock,
  TrendingUp,
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface TimeEntryStats {
  totalHours: number;
  thisWeekHours: number;
  thisMonthHours: number;
  averageDaily: number;
}

const ReportsPage = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<TimeEntryStats>({
    totalHours: 0,
    thisWeekHours: 0,
    thisMonthHours: 0,
    averageDaily: 0
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  useEffect(() => {
    if (profile) {
      fetchReportsData();
    }
  }, [profile]);

  const fetchReportsData = async () => {
    try {
      // Calculate date ranges
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
      
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      let query = supabase.from('time_entries').select('hours, entry_date');
      
      // If not admin, filter by user
      if (!isAdmin && profile?.id) {
        query = query.eq('user_id', profile.id);
      }

      const { data: timeEntries, error } = await query;
      
      if (error) {
        console.error('Error fetching time entries:', error);
        return;
      }

      const entries = timeEntries || [];
      
      // Calculate stats
      const totalHours = entries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
      
      const thisWeekEntries = entries.filter(entry => 
        new Date(entry.entry_date) >= startOfWeek
      );
      const thisWeekHours = thisWeekEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
      
      const thisMonthEntries = entries.filter(entry => 
        new Date(entry.entry_date) >= startOfMonth
      );
      const thisMonthHours = thisMonthEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
      
      const daysInMonth = now.getDate();
      const averageDaily = daysInMonth > 0 ? thisMonthHours / daysInMonth : 0;

      setStats({
        totalHours,
        thisWeekHours,
        thisMonthHours,
        averageDaily
      });
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {isAdmin ? 'System Reports' : 'My Reports'}
        </h2>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">All time logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeekHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Hours this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Hours this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDaily.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Hours per day</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timesheet">Timesheet Analysis</TabsTrigger>
          {isAdmin && <TabsTrigger value="team">Team Performance</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Hours Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <p>Charts will be implemented here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                  <p>Project breakdown charts coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timesheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Timesheet Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <p>Detailed timesheet analysis will be shown here</p>
                <p className="text-sm mt-2">Including daily breakdowns and project allocations</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4" />
                  <p>Team performance metrics will be displayed here</p>
                  <p className="text-sm mt-2">Employee productivity and project progress</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ReportsPage;
