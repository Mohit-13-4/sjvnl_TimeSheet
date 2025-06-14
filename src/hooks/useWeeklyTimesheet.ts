
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

export const useWeeklyTimesheet = () => {
  const { toast } = useToast();
  const [projects] = useState<Project[]>([
    { id: "1", name: "Website", allocated_hours: 40 },
    { id: "2", name: "Web Page", allocated_hours: 30 }
  ]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>({});
  const [leaveStatus, setLeaveStatus] = useState<LeaveStatus>({});
  const [comment, setComment] = useState("");

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get the start of the week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d;
  };

  // Get week dates starting from Monday
  const getWeekDates = () => {
    const weekStart = getWeekStart(currentWeek);
    return daysOfWeek.map((_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return date;
    });
  };

  // Format date range
  const getWeekRange = () => {
    const dates = getWeekDates();
    const start = dates[0];
    const end = dates[6];
    return `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')}/${start.getFullYear()} - ${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1).toString().padStart(2, '0')}/${end.getFullYear()}`;
  };

  // Get week number
  const getWeekNumber = () => {
    const d = new Date(currentWeek);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  // Navigate weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  // Update hours for a project and day with 8-hour daily limit
  const updateHours = (projectId: string, day: string, hours: string) => {
    const numericHours = parseFloat(hours) || 0;
    
    // Calculate current total for the day excluding this project
    const currentDayTotal = projects.reduce((total, project) => {
      if (project.id === projectId) return total;
      return total + (weeklyHours[project.id]?.[day] || 0);
    }, 0);
    
    // Check if adding these hours would exceed 8 hours per day
    const newTotal = currentDayTotal + numericHours;
    if (newTotal > 8) {
      toast({
        title: "Daily Limit Exceeded",
        description: `Cannot exceed 8 hours per day. Current total: ${currentDayTotal.toFixed(1)} hours. Maximum you can add: ${(8 - currentDayTotal).toFixed(1)} hours.`,
        variant: "destructive"
      });
      return;
    }
    
    setWeeklyHours(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [day]: numericHours
      }
    }));
  };

  // Toggle leave status
  const toggleLeave = (day: string) => {
    setLeaveStatus(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  // Calculate daily totals
  const getDayTotal = (day: string) => {
    return projects.reduce((total, project) => {
      return total + (weeklyHours[project.id]?.[day] || 0);
    }, 0);
  };

  // Calculate project totals
  const getProjectTotal = (projectId: string) => {
    return daysOfWeek.reduce((total, day) => {
      return total + (weeklyHours[projectId]?.[day] || 0);
    }, 0);
  };

  // Calculate grand total
  const getGrandTotal = () => {
    return projects.reduce((total, project) => {
      return total + getProjectTotal(project.id);
    }, 0);
  };

  // Count leave days
  const getLeaveCount = () => {
    return Object.values(leaveStatus).filter(Boolean).length;
  };

  // Calculate adjusted weekly target based on holidays
  const getWeeklyTarget = () => {
    const leaveCount = getLeaveCount();
    const baseTarget = 40;
    const hoursPerDay = 8;
    
    if (leaveCount <= 2) {
      return baseTarget;
    }
    
    const excessHolidays = leaveCount - 2;
    return Math.max(0, baseTarget - (excessHolidays * hoursPerDay));
  };

  // Handle save
  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Timesheet saved as draft"
    });
  };

  // Handle submit
  const handleSubmit = () => {
    toast({
      title: "Submitted",
      description: "Timesheet submitted for approval"
    });
  };

  return {
    projects,
    currentWeek,
    weeklyHours,
    leaveStatus,
    comment,
    setComment,
    daysOfWeek,
    getWeekDates,
    getWeekRange,
    getWeekNumber,
    navigateWeek,
    setCurrentWeek,
    updateHours,
    toggleLeave,
    getDayTotal,
    getProjectTotal,
    getGrandTotal,
    getLeaveCount,
    getWeeklyTarget,
    handleSave,
    handleSubmit
  };
};
