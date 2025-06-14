
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Project {
  id: string;
  name: string;
  allocated_hours: number;
}

interface WeeklyHours {
  [projectId: string]: {
    [day: string]: number;
  };
}

interface LeaveStatus {
  [day: string]: boolean;
}

interface TimesheetTableProps {
  projects: Project[];
  daysOfWeek: string[];
  weekDates: Date[];
  weeklyHours: WeeklyHours;
  leaveStatus: LeaveStatus;
  isAdmin: boolean;
  onUpdateHours: (projectId: string, day: string, hours: string) => void;
  onToggleLeave: (day: string) => void;
  getProjectTotal: (projectId: string) => number;
  getDayTotal: (day: string) => number;
  getGrandTotal: () => number;
  getLeaveCount: () => number;
}

const TimesheetTable = ({
  projects,
  daysOfWeek,
  weekDates,
  weeklyHours,
  leaveStatus,
  isAdmin,
  onUpdateHours,
  onToggleLeave,
  getProjectTotal,
  getDayTotal,
  getGrandTotal,
  getLeaveCount
}: TimesheetTableProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 font-medium">PROJECTS/TASKS</th>
                {weekDates.map((date, index) => (
                  <th key={index} className="text-center p-4 font-medium min-w-[120px]">
                    <div>{daysOfWeek[index]}</div>
                    <div className="text-sm text-gray-500 font-normal">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </th>
                ))}
                <th className="text-center p-4 font-medium">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b">
                  <td className="p-4 font-medium">{project.name}</td>
                  {daysOfWeek.map((day) => (
                    <td key={day} className="p-2">
                      {isAdmin ? (
                        <div className="text-center p-2 text-gray-400 italic">
                          View Only
                        </div>
                      ) : (
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          max="8"
                          value={weeklyHours[project.id]?.[day] || ''}
                          onChange={(e) => onUpdateHours(project.id, day, e.target.value)}
                          className="text-center"
                          placeholder="0.00"
                        />
                      )}
                    </td>
                  ))}
                  <td className="p-4 text-center font-medium">
                    {getProjectTotal(project.id).toFixed(2)}
                  </td>
                </tr>
              ))}
              
              {/* Leave/Holiday Row */}
              <tr className="border-b bg-orange-50">
                <td className="p-4 font-medium text-orange-600">Leave/Holiday</td>
                {daysOfWeek.map((day) => (
                  <td key={day} className="p-4 text-center">
                    {isAdmin ? (
                      <div className="text-gray-400 italic">View Only</div>
                    ) : (
                      <Checkbox
                        checked={leaveStatus[day] || false}
                        onCheckedChange={() => onToggleLeave(day)}
                      />
                    )}
                  </td>
                ))}
                <td className="p-4 text-center font-medium text-orange-600">
                  {getLeaveCount()} days
                </td>
              </tr>

              {/* Total Hours Row */}
              <tr className="border-b bg-gray-50 font-bold">
                <td className="p-4">TOTAL HOURS</td>
                {daysOfWeek.map((day) => (
                  <td key={day} className="p-4 text-center">
                    {getDayTotal(day).toFixed(2)}
                  </td>
                ))}
                <td className="p-4 text-center">
                  {getGrandTotal().toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimesheetTable;
