
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";
import AdminPage from "@/components/AdminPage";
import TimeTracker from "@/components/TimeTracker";
import WeeklyTimesheet from "@/components/WeeklyTimesheet";
import ProjectsPage from "@/components/ProjectsPage";
import ReportsPage from "@/components/ReportsPage";
import ProfilePage from "@/components/ProfilePage";
import SettingsPage from "@/components/SettingsPage";
import EmployeesPage from "@/components/EmployeesPage";

const MainApp = () => {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState("");

  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  // Set initial view based on user role - but only after profile is loaded
  useEffect(() => {
    if (profile && !currentView) {
      console.log('Setting initial view for role:', profile.role);
      // Admin users get redirected to admin panel
      if (isAdmin) {
        setCurrentView('admin-panel');
      } else {
        // Regular employees start with timesheet view
        setCurrentView('timesheet');
      }
    }
  }, [profile, currentView, isAdmin]);

  // Reset view when user changes
  useEffect(() => {
    if (!user) {
      setCurrentView("");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page when no user is authenticated
  if (!user) {
    return <AuthPage />;
  }

  // If admin user, show admin panel
  if (isAdmin && currentView === 'admin-panel') {
    return <AdminPage />;
  }

  const renderContent = () => {
    console.log('Rendering content for view:', currentView, 'Profile role:', profile?.role);
    
    switch (currentView) {
      case "dashboard":
        return <Dashboard onViewChange={setCurrentView} />;
      case "timesheet":
        return <WeeklyTimesheet />;
      case "time-tracker":
        return <TimeTracker />;
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
        // Default to timesheet for employee users
        return <WeeklyTimesheet />;
    }
  };

  // Regular employee interface
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default Index;
