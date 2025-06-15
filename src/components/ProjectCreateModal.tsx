
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast"; // shadcn toast import
import { supabase } from "@/integrations/supabase/client"; // for saving

interface ProjectCreateModalProps {
  open: boolean;
  onClose: () => void;
  onProjectCreated: () => void; // To refresh list
}

const ProjectCreateModal = ({ open, onClose, onProjectCreated }: ProjectCreateModalProps) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "active",
    start_date: "",
    end_date: "",
    allocated_hours: "",
    assigned_to: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Save to supabase
    try {
      const { error } = await supabase.from("projects").insert([{
        ...form,
        allocated_hours: Number(form.allocated_hours) || 0,
        start_date: form.start_date,
        end_date: form.end_date,
      }]);
      if (error) throw error;
      toast({ title: "Project created!", description: "Your project was added successfully." });
      onProjectCreated();
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to create project", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input required name="name" value={form.name} onChange={handleChange} placeholder="Project Name" />
          <textarea required name="description" value={form.description} onChange={handleChange} placeholder="Description" className="rounded-md border border-input px-3 py-2" />
          <div className="flex gap-2">
            <Input required name="start_date" type="date" value={form.start_date} onChange={handleChange} />
            <Input required name="end_date" type="date" value={form.end_date} onChange={handleChange} />
          </div>
          <Input required name="allocated_hours" type="number" value={form.allocated_hours} onChange={handleChange} placeholder="Allocated Hours" />
          <Input name="assigned_to" value={form.assigned_to} onChange={handleChange} placeholder="Assign to Employee ID (optional)" />
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Project"}</Button>
        </form>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreateModal;
