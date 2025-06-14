
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";
import AdminDashboard from "@/components/AdminDashboard";
import TimeTracker from "@/components/TimeTracker";
import WeeklyTimesheet from "@/components/WeeklyTimesheet";

const MainApp = () => {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState("");

  // Set initial view based on user role - but only after profile is loaded
  useEffect(() => {
    if (profile && !currentView) {
      console.log('Setting initial view for role:', profile.role);
      // Both admin and employee start with dashboard view
      setCurrentView('dashboard');
    }
  }, [profile, currentView]);

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

  const renderContent = () => {
    console.log('Rendering content for view:', currentView, 'Profile role:', profile?.role);
    
    switch (currentView) {
      case "dashboard":
        return <Dashboard onViewChange={setCurrentView} />;
      case "admin-dashboard":
        return <AdminDashboard />;
      case "timesheet":
        return <WeeklyTimesheet />;
      case "time-tracker":
        return <TimeTracker />;
      case "projects":
        return <div className="p-6">Projects View</div>;
      case "employees":
        return <div className="p-6">Employee Management View</div>;
      case "reports":
        return <div className="p-6">Reports View</div>;
      case "profile":
        return <div className="p-6">Profile View</div>;
      case "settings":
        return <div className="p-6">Settings View</div>;
      default:
        // Default to dashboard for both admin and employee
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

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
