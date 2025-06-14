
import { Button } from "@/components/ui/button";

interface TimesheetActionsProps {
  onSave: () => void;
  onSubmit: () => void;
}

const TimesheetActions = ({ onSave, onSubmit }: TimesheetActionsProps) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button variant="outline" onClick={onSave}>
        Save
      </Button>
      <Button onClick={onSubmit}>
        Submit
      </Button>
    </div>
  );
};

export default TimesheetActions;
