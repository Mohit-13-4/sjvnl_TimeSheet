
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface WeekNavigationProps {
  weekRange: string;
  weekNumber: number;
  currentWeek: Date;
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  onWeekSelect: (date: Date | undefined) => void;
}

const WeekNavigation = ({
  weekRange,
  weekNumber,
  currentWeek,
  showCalendar,
  setShowCalendar,
  onNavigateWeek,
  onWeekSelect
}: WeekNavigationProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium">{weekRange}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={() => onNavigateWeek('prev')}>
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    Select Week
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={currentWeek}
                    onSelect={onWeekSelect}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm" onClick={() => onNavigateWeek('next')}>
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {currentWeek.getFullYear()} - Week {weekNumber}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekNavigation;
