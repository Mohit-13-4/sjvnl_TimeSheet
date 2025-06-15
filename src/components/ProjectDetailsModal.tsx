
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  allocated_hours: number;
  assigned_to: string;
  assigned_by: string;
}

interface ProjectDetailsModalProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-800";
    case "completed": return "bg-blue-100 text-blue-800";
    case "on_hold": return "bg-yellow-100 text-yellow-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const ProjectDetailsModal = ({ project, open, onClose, isAdmin }: ProjectDetailsModalProps) => {
  if (!project) return null;
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-between items-center gap-2">
            <DialogTitle>{project.name}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Badge className={getStatusColor(project.status)}>{project.status.replace('_', ' ').toUpperCase()}</Badge>
        </DialogHeader>
        <div className="mb-2 text-gray-600">{project.description || "No description available"}</div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center text-gray-500">
            <Calendar className="w-4 h-4 mr-1.5" />
            <span>
              {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-1.5" />
            {project.allocated_hours} hours allocated
          </div>
          {isAdmin && (
            <>
              <div className="flex items-center text-gray-500">
                <User className="w-4 h-4 mr-1.5" />
                Assigned to: {project.assigned_to || 'Employee'}
              </div>
              <div className="flex items-center text-gray-500">
                <User className="w-4 h-4 mr-1.5" />
                Assigned by: {project.assigned_by || 'Admin'}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsModal;
