
import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface ProjectFilterDropdownProps {
  status: string | null;
  onChange: (status: string | null) => void;
}

const statuses = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

const ProjectFilterDropdown = ({ status, onChange }: ProjectFilterDropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          {status ? statuses.find(s => s.value === status)?.label : "Filter"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40">
        <div>
          {statuses.map(s => (
            <Button
              key={s.value}
              size="sm"
              variant={status === s.value || (!status && s.value === "") ? "default" : "ghost"}
              className="mb-2 w-full justify-start"
              onClick={() => {
                onChange(s.value || null);
                setOpen(false);
              }}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProjectFilterDropdown;
