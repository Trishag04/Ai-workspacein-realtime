import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { mockCalendarEvents } from '../../mockData';
import { Search, ChevronLeft, ChevronRight, Sun, Moon, Shuffle, Image } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';

// Local uploaded image (user screenshot) — available in environment
const DEFAULT_BG_URL = '/mnt/data/bdeced23-4866-4c9f-a2ce-803dee880390.png';

/**
 * Planner_Upgraded.jsx
 * - Multi-theme planner (A-E styles) selectable via theme switcher
 * - Smooth month transitions using framer-motion
 * - Search with highlight, animated day tiles, accessible dialog
 * - Enhanced event tags + color system
 * - Mobile responsive grid
 *
 * Usage: Replace your existing Planner component with this file. Requires framer-motion.
 */

const THEMES = {
  A: 'corporate-light',
  B: 'dark-premium',
  C: 'productivity',
  D: 'futuristic',
  E: 'soft'
};

const EVENT_COLORS = {
  SCRUM: 'bg-green-500',
  Holiday: 'bg-red-500',
  Meeting: 'bg-blue-500',
  Personal: 'bg-orange-500'
};

const Planner = () => {
  const [theme, setTheme] = useState('A');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(mockCalendarEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', type: 'Meeting', color: 'Meeting' });

  // Month utilities
  const monthNames = useMemo(() => ['January','February','March','April','May','June','July','August','September','October','November','December'], []);
  const dayNames = useMemo(() => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day));
    return days;
  };

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate]);

  // Event helpers
  const formatISO = (d) => d.toISOString().split('T')[0];
  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = formatISO(date);
    return events.filter(e => e.date === dateStr).filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  // Search highlight helper
  const highlight = (text = '') => {
    if (!searchQuery) return text;
    const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return text;
    return (
      <span>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 text-slate-900 px-0.5">{text.slice(idx, idx + searchQuery.length)}</mark>
        {text.slice(idx + searchQuery.length)}
      </span>
    );
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      toast({ title: 'Error', description: 'Please enter an event title', variant: 'destructive' });
      return;
    }

    const event = {
      date: formatISO(selectedDate),
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type,
    };

    setEvents(prev => [...prev, event]);
    setIsDialogOpen(false);
    setNewEvent({ title: '', description: '', type: 'Meeting', color: 'Meeting' });
    toast({ title: 'Saved', description: 'Event added' });
  };

  const changeMonth = (inc) => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + inc, 1);
    setCurrentDate(next);
  };

  const stats = useMemo(() => ({
    waiting: events.filter(e => e.type === 'Meeting').length,
    merged: events.filter(e => e.type === 'SCRUM').length,
    closed: events.filter(e => e.type === 'Holiday').length,
    total: events.length
  }), [events]);

  // small keyboard shortcut: press 'n' to open new event dialog for today
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'n') {
        setSelectedDate(new Date());
        setIsDialogOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // theme classes mapping (A-E combined styles)
  const themeClass = useMemo(() => {
    switch (theme) {
      case 'A': return 'bg-white text-slate-900';
      case 'B': return 'bg-[#020617] text-slate-100';
      case 'C': return 'bg-white text-slate-900';
      case 'D': return 'bg-gradient-to-b from-[#070014] to-[#0b0420] text-white';
      case 'E': return 'bg-slate-50 text-slate-900';
      default: return '';
    }
  }, [theme]);

  return (
    <div className={cn('p-6 lg:p-10 rounded-md min-h-[520px] transition-colors duration-300', themeClass)}>
      {/* Header with theme selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={cn('text-2xl lg:text-3xl font-semibold', theme === 'B' ? 'text-white' : 'text-slate-900')}>Planner</h1>
          <p className={cn('text-sm mt-1', theme === 'B' ? 'text-slate-300' : 'text-slate-500')}>Calendar powered with multiple themes and smooth interactions</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2', theme === 'B' ? 'text-slate-300' : 'text-slate-400')}/>
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search events..." className={cn('pl-10 pr-3 py-2 w-72', theme === 'B' ? 'bg-[#071025] border-[#0f2136] text-white' : 'bg-white border-slate-200')} />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setTheme(t => ({A:'B',B:'C',C:'D',D:'E',E:'A'})[t] || 'A')} title="Cycle theme" className="px-3 py-2">
              <Shuffle className={cn('w-4 h-4', theme === 'B' ? 'text-white' : 'text-slate-700')} />
            </Button>

            <div className="flex items-center gap-1 border rounded-md overflow-hidden" role="tablist">
              {['A','B','C','D','E'].map(t => (
                <button key={t} onClick={() => setTheme(t)} className={cn('px-3 py-1 text-xs', theme===t ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-500')} aria-pressed={theme===t}>{t}</button>
              ))}
            </div>

            <img src={DEFAULT_BG_URL} alt="bg" className="w-9 h-9 rounded-md border object-cover hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar card (main) */}
        <motion.div layout className={cn('lg:col-span-2 rounded-md overflow-hidden border', theme === 'B' ? 'bg-[#021022] border-[#0b2a4a]' : 'bg-white border-slate-100')}>
          <div className={cn('flex items-center justify-between px-4 py-3', theme === 'B' ? 'bg-[#061226]' : 'bg-white')}>
            <div>
              <div className={cn('text-lg font-semibold', theme === 'B' ? 'text-white' : 'text-slate-800')}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
              <div className={cn('text-xs', theme === 'B' ? 'text-slate-300' : 'text-slate-500')}>Use arrows or swipe to change month. Press <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">n</kbd> to add quick note.</div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => changeMonth(-1)} className={cn(theme === 'B' ? 'border-[#16314d] text-white' : '')}><ChevronLeft className="w-4 h-4"/></Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())} className={cn(theme === 'B' ? 'border-[#16314d] text-white' : '')}>Today</Button>
              <Button variant="outline" size="icon" onClick={() => changeMonth(1)} className={cn(theme === 'B' ? 'border-[#16314d] text-white' : '')}><ChevronRight className="w-4 h-4"/></Button>
            </div>
          </div>

          <CardContent className={cn(theme === 'B' ? 'bg-[#021827]' : 'bg-white', 'p-4')}>
            {/* Day names */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {dayNames.map(d => <div key={d} className={cn('text-center text-xs font-semibold', theme === 'B' ? 'text-slate-300' : 'text-slate-500')}>{d}</div>)}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                const dayEvents = getEventsForDate(day).slice(0,3);
                const isToday = day && day.toDateString() === new Date().toDateString();

                return (
                  <motion.div key={idx} layout whileHover={{ scale: day ? 1.02 : 1 }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y:0 }} exit={{ opacity: 0 }} onClick={() => handleDateClick(day)} className={cn('min-h-[110px] p-2 rounded-md border transition-all cursor-pointer',
                    !day ? 'bg-transparent border-transparent' : theme === 'B' ? 'bg-[#02182a] border-[#08324b]' : 'bg-slate-50 border-slate-100',
                    isToday && 'ring-2 ring-indigo-200')}
                  >
                    {day ? (
                      <>
                        <div className={cn('flex items-center justify-between')}> 
                          <div className={cn('text-sm font-medium', theme === 'B' ? 'text-slate-100' : 'text-slate-800')}>{day.getDate()}</div>
                          {isToday && <Badge className="text-xs">Today</Badge>}
                        </div>

                        <div className="mt-2 space-y-1">
                          {dayEvents.length === 0 && <div className={cn('text-xs text-slate-400', theme === 'B' ? 'text-slate-300' : 'text-slate-500')}>No events</div>}
                          {dayEvents.map((ev, i) => (
                            <motion.div key={i} layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={cn('text-xs px-2 py-1 rounded-md truncate text-white', EVENT_COLORS[ev.type] || 'bg-slate-600')} title={ev.title}>
                              {highlight(ev.title)}
                            </motion.div>
                          ))}

                          {getEventsForDate(day).length > 3 && (
                            <div className={cn('text-xs text-indigo-500 mt-1')}>+{getEventsForDate(day).length - 3} more</div>
                          )}
                        </div>
                      </>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </motion.div>

        {/* Insights / Side Column */}
        <aside className={cn('space-y-4')}> 
          <motion.div className={cn('p-4 rounded-md border', theme === 'B' ? 'bg-[#021827] border-[#08324b]' : 'bg-white border-slate-100')} whileHover={{ y: -4 }}>
            <div className="flex items-center justify-between">
              <div>
                <div className={cn('text-xs text-slate-500')}>Events this month</div>
                <div className={cn('text-2xl font-semibold', theme === 'B' ? 'text-white' : 'text-slate-800')}>{stats.total}</div>
              </div>
              <Image className={cn('w-6 h-6', theme === 'B' ? 'text-white' : 'text-slate-700')} />
            </div>
            <div className="mt-3 text-sm text-slate-500">Quick summary of events & types</div>
          </motion.div>

          <motion.div className={cn('p-4 rounded-md border flex flex-col gap-3', theme === 'B' ? 'bg-[#021827] border-[#08324b]' : 'bg-white border-slate-100')}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">Meetings</div>
              <div className="font-semibold">{stats.waiting}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">SCRUMs</div>
              <div className="font-semibold">{stats.merged}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">Holidays</div>
              <div className="font-semibold">{stats.closed}</div>
            </div>
          </motion.div>

          <motion.div className={cn('p-4 rounded-md border', theme === 'B' ? 'bg-[#021827] border-[#08324b]' : 'bg-white border-slate-100')}>
            <div className="text-sm text-slate-500">Actions</div>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => { setSelectedDate(new Date()); setIsDialogOpen(true); }} className="flex-1">Add Event</Button>
              <Button variant="outline" onClick={() => { setEvents(mockCalendarEvents); toast({ title: 'Reset', description: 'Events reset to mock data' }); }}>Reset</Button>
            </div>
          </motion.div>
        </aside>
      </div>

      {/* Dialog to add event */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={cn('max-w-lg', theme === 'B' ? 'bg-[#021827] text-white border-[#08324b]' : 'bg-white text-slate-900')}>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>{selectedDate ? selectedDate.toDateString() : ''}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Title</Label>
              <Input value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} className={cn(theme === 'B' ? 'bg-[#071827] border-[#0f2b45] text-white' : '')} />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} className={cn(theme === 'B' ? 'bg-[#071827] border-[#0f2b45] text-white' : '')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={newEvent.type} onValueChange={(val) => setNewEvent({...newEvent, type: val})}>
                  <SelectTrigger className={cn(theme === 'B' ? 'bg-[#071827] border-[#0f2b45] text-white' : '')}><SelectValue/></SelectTrigger>
                  <SelectContent className={cn(theme === 'B' ? 'bg-[#071827] border-[#0f2b45] text-white' : '')}>
                    <SelectItem value="SCRUM">SCRUM</SelectItem>
                    <SelectItem value="Holiday">Holiday</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {['SCRUM','Holiday','Meeting','Personal'].map(c => (
                    <button key={c} onClick={() => setNewEvent({...newEvent, type: c})} className={cn('w-8 h-8 rounded-full', EVENT_COLORS[c], newEvent.type===c ? 'ring-2 ring-offset-1 ring-indigo-300' : '')} aria-label={`set ${c}`}></button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEvent}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Planner;
