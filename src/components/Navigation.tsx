
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from "@/components/ui/navigation-menu";
import { 
  Calendar, 
  BarChart3, 
  Settings, 
  Users, 
  ClipboardList, 
  LogOut,
  User,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const { profile, signOut } = useAuth();

  const employeeMenuItems = [
    { id: "timesheet", label: "Timesheet", icon: Clock },
    { id: "projects", label: "My Projects", icon: ClipboardList },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
  ];

  const adminMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "employees", label: "Employees", icon: Users },
    { id: "projects", label: "Project Management", icon: ClipboardList },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const superAdminMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "admin-management", label: "Admin Management", icon: Users },
    { id: "employees", label: "All Employees", icon: Users },
    { id: "projects", label: "All Projects", icon: ClipboardList },
    { id: "reports", label: "System Reports", icon: BarChart3 },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  const getMenuItems = () => {
    switch (profile?.role) {
      case 'super_admin':
        return superAdminMenuItems;
      case 'admin':
        return adminMenuItems;
      default:
        return employeeMenuItems;
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <div className="text-blue-500 font-bold text-xs">SJVN</div>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TimeTracker</h1>
            </div>
          </div>

          {/* Navigation Menu */}
          <NavigationMenu>
            <NavigationMenuList className="space-x-2">
              {getMenuItems().map((item) => (
                <NavigationMenuItem key={item.id}>
                  <Button
                    variant={currentView === item.id ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                    onClick={() => onViewChange(item.id)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Welcome, {profile?.full_name || 'User'}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {profile?.role?.replace('_', ' ') || 'Employee'} • ID: {profile?.employee_id}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
