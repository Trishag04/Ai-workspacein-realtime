import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const AddProjectModal = ({ isOpen, onClose, onAddProject }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Upcoming'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const newProject = {
      id: `PRJ${Date.now()}`,
      ...formData,
      progress: 0,
      deadline: ''
    };
    
    onAddProject(newProject);
    toast.success('Project created successfully!');
    setFormData({ title: '', description: '', status: 'Upcoming' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold" style={{fontFamily: 'Work Sans'}}>Add New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="project-title" className="text-slate-200">Project Title *</Label>
            <Input
              id="project-title"
              data-testid="add-project-title-input"
              placeholder="Enter project title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description" className="text-slate-200">Short Description *</Label>
            <Textarea
              id="project-description"
              data-testid="add-project-description-input"
              placeholder="Enter project description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-status" className="text-slate-200">Status *</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, status: value })} value={formData.status}>
              <SelectTrigger data-testid="add-project-status-select" className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="Ongoing" className="text-white">Ongoing</SelectItem>
                <SelectItem value="Upcoming" className="text-white">Upcoming</SelectItem>
                <SelectItem value="Completed" className="text-white">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="add-project-cancel-btn"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="add-project-save-btn"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;