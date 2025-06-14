
import { Card, CardContent } from "@/components/ui/card";

interface WorkingHoursInfoProps {
  weeklyTarget: number;
  leaveCount: number;
  grandTotal: number;
}

const WorkingHoursInfo = ({ weeklyTarget, leaveCount, grandTotal }: WorkingHoursInfoProps) => {
  return (
    <Card className="bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="text-blue-700">
            <span className="font-medium">Working Hours:</span> 8 hours per day
          </div>
          <div className="text-blue-700">
            <span className="font-medium">Weekly Target:</span> {weeklyTarget} hours
            {leaveCount > 0 && <span className="text-orange-600 ml-1">({leaveCount} holiday{leaveCount > 1 ? 's' : ''})</span>}
          </div>
          <div className="text-blue-700">
            <span className="font-medium">Current Total:</span> {grandTotal.toFixed(2)} hours
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkingHoursInfo;
