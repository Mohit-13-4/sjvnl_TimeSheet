
import { useState } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import AuthPage from "@/components/AuthPage";
import ForgotPasswordPage from "@/components/ForgotPasswordPage";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "@/components/Dashboard";
import TimeTracker from "@/components/TimeTracker";

const IndexContent = () => {
  const { user, loading } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [currentView, setCurrentView] = useState("timesheet");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    if (showForgotPassword) {
      return (
        <ForgotPasswordPage 
          onBack={() => setShowForgotPassword(false)}
        />
      );
    }
    return (
      <AuthPage 
        onAuthSuccess={() => setCurrentView("timesheet")}
      />
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onViewChange={setCurrentView} />;
      case "timesheet":
        return <TimeTracker userRole="Employee" onLogout={() => {}} />;
      case "projects":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Projects</h2>
            <p>Project management interface will be implemented here.</p>
          </div>
        );
      case "reports":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Reports</h2>
            <p>Reporting interface will be implemented here.</p>
          </div>
        );
      case "employees":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Employee Management</h2>
            <p>Employee management interface will be implemented here.</p>
          </div>
        );
      case "profile":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            <p>Profile management interface will be implemented here.</p>
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p>Settings interface will be implemented here.</p>
          </div>
        );
      default:
        return <TimeTracker userRole="Employee" onLogout={() => {}} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
        <SidebarInset className="flex-1">
          <main className="p-6">
            {renderCurrentView()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <IndexContent />
    </AuthProvider>
  );
};

export default Index;
