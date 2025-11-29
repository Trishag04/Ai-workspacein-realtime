import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EVENT_TYPES } from '@/utils/constants';
import { toast } from 'sonner';

const AddEventModal = ({ isOpen, onClose, selectedDate, onAddEvent }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'SCRUM'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const newEvent = {
      id: `EVT${Date.now()}`,
      date: selectedDate,
      ...formData
    };
    
    onAddEvent(newEvent);
    toast.success('Event added successfully!');
    setFormData({ title: '', description: '', type: 'SCRUM' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold" style={{fontFamily: 'Work Sans'}}>Add Event</DialogTitle>
          <p className="text-slate-400 text-sm">Date: {selectedDate}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="event-title" className="text-slate-200">Title *</Label>
            <Input
              id="event-title"
              data-testid="add-event-title-input"
              placeholder="Enter event title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-description" className="text-slate-200">Description</Label>
            <Textarea
              id="event-description"
              data-testid="add-event-description-input"
              placeholder="Enter event description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-type" className="text-slate-200">Event Type *</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, type: value })} value={formData.type}>
              <SelectTrigger data-testid="add-event-type-select" className="bg-slate-900/50 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {Object.entries(EVENT_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={key} className="text-white">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${value.color}`}></div>
                      {value.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="add-event-cancel-btn"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="add-event-save-btn"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventModal;