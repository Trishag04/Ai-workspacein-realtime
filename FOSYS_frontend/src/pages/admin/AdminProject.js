import React from 'react';
import { Database, Users, FolderKanban } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const AdminProjects = () => {
  const projects = [
    { id: 1, title: 'Authentication System', manager: 'Michael Chen', team: 8, progress: 85, status: 'Ongoing' },
    { id: 2, title: 'Dashboard Redesign', manager: 'Michael Chen', team: 6, progress: 60, status: 'Ongoing' },
    { id: 3, title: 'API Documentation', manager: 'Michael Chen', team: 4, progress: 45, status: 'Ongoing' },
    { id: 4, title: 'Mobile App', manager: 'Michael Chen', team: 5, progress: 30, status: 'Upcoming' },
    { id: 5, title: 'Legacy System Migration', manager: 'Michael Chen', team: 7, progress: 100, status: 'Completed' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-emerald-400';
      case 'Ongoing':
        return 'text-blue-400';
      case 'Upcoming':
        return 'text-yellow-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="p-8" data-testid="admin-projects-page">
      <h1
        className="text-4xl font-bold text-white mb-8"
        style={{ fontFamily: 'Work Sans' }}
      >
        Projects Overview
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-slate-900/50 rounded-xl border border-slate-800 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <FolderKanban className="w-6 h-6 text-indigo-400" />
              <h2
                className="text-xl font-semibold text-white"
                style={{ fontFamily: 'Work Sans' }}
              >
                {project.title}
              </h2>
            </div>

            <div className="space-y-3">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Progress</span>
                  <span className="text-slate-400 text-sm">
                    {project.progress}%
                  </span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Manager */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Manager</span>
                <span className="text-white">{project.manager}</span>
              </div>

              {/* Team */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Team Size</span>
                <span className="text-white">{project.team} members</span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <span className={`font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProjects;
