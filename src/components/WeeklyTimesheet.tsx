
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWeeklyTimesheet } from "@/hooks/useWeeklyTimesheet";
import TimesheetHeader from "./timesheet/TimesheetHeader";
import WeekNavigation from "./timesheet/WeekNavigation";
import WorkingHoursInfo from "./timesheet/WorkingHoursInfo";
import TimesheetTable from "./timesheet/TimesheetTable";
import CommentSection from "./timesheet/CommentSection";
import TimesheetActions from "./timesheet/TimesheetActions";

const WeeklyTimesheet = () => {
  const { profile } = useAuth();
  const [showCalendar, setShowCalendar] = useState(false);
  
  const {
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
  } = useWeeklyTimesheet();

  // Check if user is admin
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  // Handle week selection from calendar
  const handleWeekSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentWeek(date);
      setShowCalendar(false);
    }
  };

  const weekDates = getWeekDates();

  return (
    <div className="space-y-6">
      <TimesheetHeader />

      <WeekNavigation
        weekRange={getWeekRange()}
        weekNumber={getWeekNumber()}
        currentWeek={currentWeek}
        showCalendar={showCalendar}
        setShowCalendar={setShowCalendar}
        onNavigateWeek={navigateWeek}
        onWeekSelect={handleWeekSelect}
      />

      <WorkingHoursInfo
        weeklyTarget={getWeeklyTarget()}
        leaveCount={getLeaveCount()}
        grandTotal={getGrandTotal()}
      />

      <TimesheetTable
        projects={projects}
        daysOfWeek={daysOfWeek}
        weekDates={weekDates}
        weeklyHours={weeklyHours}
        leaveStatus={leaveStatus}
        isAdmin={isAdmin}
        onUpdateHours={updateHours}
        onToggleLeave={toggleLeave}
        getProjectTotal={getProjectTotal}
        getDayTotal={getDayTotal}
        getGrandTotal={getGrandTotal}
        getLeaveCount={getLeaveCount}
      />

      <CommentSection
        comment={comment}
        onCommentChange={setComment}
        isAdmin={isAdmin}
      />

      {!isAdmin && (
        <TimesheetActions
          onSave={handleSave}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default WeeklyTimesheet;
