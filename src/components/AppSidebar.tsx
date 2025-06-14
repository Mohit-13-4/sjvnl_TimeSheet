
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  BarChart3, 
  ClipboardList, 
  User,
  LogOut,
  Settings,
  Users,
  UserPlus,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AppSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const AppSidebar = ({ currentView, onViewChange }: AppSidebarProps) => {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getMenuItems = () => {
    console.log('Sidebar - Profile role:', profile?.role, 'Full profile:', profile);
    
    // Force admin view if role is admin
    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
      return [
        {
          id: "dashboard",
          title: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          id: "admin-dashboard",
          title: "Task Assignment",
          icon: UserPlus,
        },
        {
          id: "timesheet",
          title: "Timesheet",
          icon: Clock,
        },
        {
          id: "projects",
          title: "All Projects",
          icon: ClipboardList,
        },
        {
          id: "employees",
          title: "Employee Management",
          icon: Users,
        },
        {
          id: "reports",
          title: "Reports",
          icon: BarChart3,
        },
        {
          id: "profile",
          title: "Profile",
          icon: User,
        },
        {
          id: "settings",
          title: "Settings",
          icon: Settings,
        },
      ];
    }

    // Employee menu items (default)
    return [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "timesheet",
        title: "Timesheet",
        icon: Clock,
      },
      {
        id: "projects",
        title: "My Projects",
        icon: ClipboardList,
      },
      {
        id: "reports",
        title: "Reports",
        icon: BarChart3,
      },
      {
        id: "profile",
        title: "Profile",
        icon: User,
      },
      {
        id: "settings",
        title: "Settings",
        icon: Settings,
      },
    ];
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
            <div className="text-white font-bold text-xs">SJVN</div>
          </div>
          <div>
            <h2 className="font-bold text-lg">TimeTracker</h2>
            <p className="text-sm text-gray-500 capitalize">
              {isAdmin ? 'Admin Panel' : 'Employee Portal'}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isAdmin ? 'Admin Navigation' : 'Employee Navigation'}
            </h3>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {getMenuItems().map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={currentView === item.id}
                    onClick={() => {
                      console.log('Clicking menu item:', item.id, 'User role:', profile?.role);
                      onViewChange(item.id);
                    }}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              Welcome, {profile?.full_name || 'User'}
            </div>
            <div className="text-xs text-gray-500">
              ID: {profile?.employee_id || 'Loading...'} | Role: {(profile?.role || 'Loading...').toUpperCase()}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
