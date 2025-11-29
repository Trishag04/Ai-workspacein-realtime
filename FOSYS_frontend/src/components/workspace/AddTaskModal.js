import React, { useState } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/utils/supabaseClient";

const AddTaskModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // get logged-in user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      toast.error("Not authenticated");
      return;
    }

    const userId = userData.user.id;

    // insert into Supabase
    const { data, error } = await supabase.from("tasks").insert([
      {
        user_id: userId,
        title: formData.title,
        description: formData.description,
        status: "Pending",
        due_date: formData.dueDate,
      },
    ]);

    if (error) {
      console.error("Supabase Error:", error);
      toast.error("Failed to create task");
      return;
    }

    toast.success("Task created successfully!");

    setFormData({ title: "", description: "", dueDate: "" });
    onClose(); // close modal
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold" style={{ fontFamily: "Work Sans" }}>
            Add New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-slate-200">Task Title *</Label>
            <Input
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-slate-200">Description</Label>
            <Textarea
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="bg-slate-900/50 border-slate-600 text-white"
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-slate-200">Due Date *</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              Save Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
