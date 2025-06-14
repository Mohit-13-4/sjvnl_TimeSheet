
import { useState, useEffect } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import AuthPage from "@/components/AuthPage";
import ForgotPasswordPage from "@/components/ForgotPasswordPage";
import AdminDashboard from "@/components/AdminDashboard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "@/components/Dashboard";
import TimeTracker from "@/components/TimeTracker";

const IndexContent = () => {
  const { user, profile, loading } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");

  // Set initial view based on user role
  useEffect(() => {
    if (profile?.role) {
      console.log('Setting initial view for role:', profile.role);
      if (profile.role === 'admin' || profile.role === 'super_admin') {
        setCurrentView("dashboard"); // Admin lands on dashboard
      } else if (profile.role === 'employee') {
        setCurrentView("timesheet"); // Employee lands on timesheet
      }
    }
  }, [profile?.role]);

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
        onAuthSuccess={() => {
          // Initial view will be set by the useEffect above based on role
        }}
      />
    );
  }

  const renderCurrentView = () => {
    console.log('Rendering view:', currentView, 'Profile role:', profile?.role);
    
    switch (currentView) {
      case "dashboard":
        return <Dashboard onViewChange={setCurrentView} />;
      case "admin-dashboard":
        return <AdminDashboard />;
      case "timesheet":
        return <TimeTracker userRole={profile?.role === 'admin' || profile?.role === 'super_admin' ? "Admin" : "Employee"} onLogout={() => {}} />;
      case "projects":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              {profile?.role === 'admin' || profile?.role === 'super_admin' ? 'All Projects' : 'My Projects'}
            </h2>
            <p>
              {profile?.role === 'admin' || profile?.role === 'super_admin'
                ? 'Manage all company projects and assignments.' 
                : 'View your assigned projects and tasks.'}
            </p>
          </div>
        );
      case "reports":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Reports</h2>
            <p>
              {profile?.role === 'admin' || profile?.role === 'super_admin'
                ? 'View comprehensive reports and analytics for all employees.' 
                : 'View your time tracking reports and performance metrics.'}
            </p>
          </div>
        );
      case "employees":
        if (profile?.role === 'admin' || profile?.role === 'super_admin') {
          return (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Employee Management</h2>
              <p>Manage employee accounts, roles, and permissions.</p>
            </div>
          );
        }
        return <Dashboard onViewChange={setCurrentView} />;
      case "profile":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Profile</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {profile?.full_name}</p>
              <p><strong>Employee ID:</strong> {profile?.employee_id}</p>
              <p><strong>Role:</strong> {profile?.role?.toUpperCase()}</p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p>
              {profile?.role === 'admin' || profile?.role === 'super_admin'
                ? 'Configure system settings and preferences.' 
                : 'Manage your account settings and preferences.'}
            </p>
          </div>
        );
      default:
        return <Dashboard onViewChange={setCurrentView} />;
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
