
import WeeklyTimesheet from "./WeeklyTimesheet";

interface TimeTrackerProps {
  userRole: string;
  onLogout: () => void;
}

const TimeTracker = ({ userRole, onLogout }: TimeTrackerProps) => {
  return <WeeklyTimesheet />;
};

export default TimeTracker;
