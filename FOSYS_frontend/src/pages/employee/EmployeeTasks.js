import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MOCK_TASKS } from '@/utils/mockData';
import { getStatusColor, formatDate } from '@/utils/constants';

const EmployeeTasks = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = MOCK_TASKS.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayTasks = filteredTasks.filter(task => task.status === 'InProgress' || task.status === 'Pending');
  const pendingTasks = filteredTasks.filter(task => task.status === 'Pending');
  const completedTasks = filteredTasks.filter(task => task.status === 'Completed');

  const TaskCard = ({ task }) => (
    <div data-testid={`task-card-${task.id}`} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-medium mb-1">{task.title}</h3>
          <p className="text-slate-400 text-sm">{task.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <span>Due: {formatDate(task.dueDate)}</span>
        <span>Created: {formatDate(task.createdDate)}</span>
      </div>
    </div>
  );

  return (
    <div className="p-8" data-testid="employee-tasks-page">
      {/* Header with Search */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-6" style={{fontFamily: 'Work Sans'}}>Tasks</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            data-testid="tasks-search-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Tasks of the Day */}
      <div className="mb-8 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <h2 className="text-2xl font-semibold text-white mb-4" style={{fontFamily: 'Work Sans'}}>Tasks of the Day</h2>
        <div className="space-y-3">
          {todayTasks.length > 0 ? (
            todayTasks.map(task => <TaskCard key={task.id} task={task} />)
          ) : (
            <p className="text-slate-400 text-center py-8">No tasks for today</p>
          )}
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="mb-8 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <h2 className="text-2xl font-semibold text-white mb-4" style={{fontFamily: 'Work Sans'}}>Pending Tasks</h2>
        <div className="space-y-3">
          {pendingTasks.length > 0 ? (
            pendingTasks.map(task => <TaskCard key={task.id} task={task} />)
          ) : (
            <p className="text-slate-400 text-center py-8">No pending tasks</p>
          )}
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <h2 className="text-2xl font-semibold text-white mb-4" style={{fontFamily: 'Work Sans'}}>Completed Tasks</h2>
        <div className="space-y-3">
          {completedTasks.length > 0 ? (
            completedTasks.map(task => <TaskCard key={task.id} task={task} />)
          ) : (
            <p className="text-slate-400 text-center py-8">No completed tasks</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeTasks;