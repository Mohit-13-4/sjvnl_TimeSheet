
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const TimesheetHeader = () => {
  const { profile } = useAuth();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold">Timesheet</h1>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Welcome, {profile?.full_name || 'Admin'}</span>
        <Button variant="ghost" size="sm">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default TimesheetHeader;
