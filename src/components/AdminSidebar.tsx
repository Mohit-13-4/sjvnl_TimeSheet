
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
  LayoutDashboard,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const AdminSidebar = ({ currentView, onViewChange }: AdminSidebarProps) => {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const adminMenuItems = [
    {
      id: "dashboard",
      title: "Admin Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "assign-tasks",
      title: "Assign Tasks",
      icon: UserPlus,
    },
    {
      id: "timesheet",
      title: "Timesheet Management",
      icon: Clock,
    },
    {
      id: "projects",
      title: "Project Management",
      icon: ClipboardList,
    },
    {
      id: "employees",
      title: "Employee Management",
      icon: Users,
    },
    {
      id: "reports",
      title: "Project Reports",
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

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-gray-200">
      <SidebarHeader className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">Admin Panel</h2>
            <p className="text-sm text-blue-100">SJVN TimeTracker</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administrative Tools
            </h3>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={currentView === item.id}
                    onClick={() => onViewChange(item.id)}
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

      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {profile?.full_name || 'Admin User'}
            </div>
            <div className="text-xs text-gray-500">
              ID: {profile?.employee_id || 'Loading...'} | Role: ADMIN
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

export { AdminSidebar };
