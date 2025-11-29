

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { MOCK_TASKS, MOCK_PROJECTS, MOCK_EMPLOYEES } from '@/utils/mockData';
import { getStatusColor, formatDate } from '@/utils/constants';
import AddTaskModal from '@/components/workspace/AddTaskModal';

const ManagerProjectTasks = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [tasks, setTasks] = useState(MOCK_TASKS || []);

  const project = (MOCK_PROJECTS || []).find(p => p.id === projectId);
  const projectTasks = (tasks || []).filter(task => task.projectId === projectId);

  const filteredTasks = projectTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayTasks = filteredTasks.filter(
    task => task.status === 'InProgress' || task.status === 'Pending'
  );
  const completedTasks = filteredTasks.filter(task => task.status === 'Completed').length;
  const totalTasks = filteredTasks.length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleAddTask = (newTask) => {
    const updatedTask = { ...newTask, projectId };
    setTasks([...tasks, updatedTask]);
  };

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-white">Project not found</p>
        <Button onClick={() => navigate('/dashboard/manager/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="manager-project-tasks-page">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => navigate('/dashboard/manager/projects')}
          variant="ghost"
          className="text-slate-400 hover:text-white mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Button>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-4xl font-bold text-white mb-2"
              style={{ fontFamily: 'Work Sans' }}
            >
              {project.title}
            </h1>
            <p className="text-slate-400">{project.description}</p>
          </div>
          <Button
            onClick={() => setShowAddTask(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </Button>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Tasks of the Day */}
      <div className="mb-8 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <h2
          className="text-2xl font-semibold text-white mb-4"
          style={{ fontFamily: 'Work Sans' }}
        >
          Tasks of the Day
        </h2>
        <div className="space-y-3">
          {todayTasks.length > 0 ? (
            todayTasks.map((task) => (
              <div
                key={task.id}
                data-testid={`task-${task.id}`}
                className="bg-slate-800/50 p-4 rounded-lg border border-slate-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{task.title}</h3>
                    <p className="text-slate-400 text-sm">{task.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Assignee: {task.assignee}</span>
                  <span>Due: {formatDate(task.dueDate)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-8">No tasks for today</p>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-8 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <h2
          className="text-2xl font-semibold text-white mb-4"
          style={{ fontFamily: 'Work Sans' }}
        >
          Progress
        </h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white">Overall Completion</span>
          <span className="text-slate-400">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-3" />
        <p className="text-slate-400 text-sm mt-2">
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>

      {/* All Tasks Table */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <h2
          className="text-2xl font-semibold text-white mb-6"
          style={{ fontFamily: 'Work Sans' }}
        >
          All Tasks
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 font-medium py-3 px-4">Task</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">
                  Assignee
                </th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">
                  Due Date
                </th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b border-slate-800">
                  <td className="py-4 px-4 text-white">{task.title}</td>
                  <td className="py-4 px-4 text-slate-300">{task.assignee}</td>
                  <td className="py-4 px-4 text-slate-400 text-sm">
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onAddTask={handleAddTask}
        employees={(MOCK_EMPLOYEES || []).filter((emp) => emp.managerId === user?.id)}
      />
    </div>
  );
};

export default ManagerProjectTasks;






