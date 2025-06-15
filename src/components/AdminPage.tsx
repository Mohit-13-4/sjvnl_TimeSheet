
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import Dashboard from "@/components/Dashboard";
import AdminDashboard from "@/components/AdminDashboard";
import WeeklyTimesheet from "@/components/WeeklyTimesheet";
import ProjectsPage from "@/components/ProjectsPage";
import ReportsPage from "@/components/ReportsPage";
import ProfilePage from "@/components/ProfilePage";
import SettingsPage from "@/components/SettingsPage";
import EmployeesPage from "@/components/EmployeesPage";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

const AdminPage = () => {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");

  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-500">You don't have permission to access the admin panel.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onViewChange={setCurrentView} />;
      case "assign-tasks":
        return <AdminDashboard />;
      case "timesheet":
        return <WeeklyTimesheet />;
      case "projects":
        return <ProjectsPage />;
      case "employees":
        return <EmployeesPage />;
      case "reports":
        return <ReportsPage />;
      case "profile":
        return <ProfilePage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg">
              <h1 className="text-2xl font-bold">Admin Control Panel</h1>
              <p className="text-blue-100">Welcome to the administrative interface, {profile?.full_name}</p>
            </div>
          </div>
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminPage;
