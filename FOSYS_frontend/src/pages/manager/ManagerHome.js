


import React from 'react';
import { FolderKanban, CheckSquare, GitPullRequest, FileText, ListTodo, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { MOCK_TASKS, MOCK_PRS, MOCK_PROJECTS } from '@/utils/mockData';
import { formatDate } from '@/utils/constants';
import { Card, CardContent } from "@/components/ui/card";

const ManagerHome = ({ user }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const stats = {
    totalProjects: MOCK_PROJECTS.length,
    ongoingProjects: MOCK_PROJECTS.filter(p => p.status === "Ongoing").length,
    completedProjects: MOCK_PROJECTS.filter(p => p.status === "Completed").length,
    totalTasks: MOCK_TASKS.length,
    completedTasks: MOCK_TASKS.filter(t => t.status === "Completed").length,
    openPRs: MOCK_PRS.filter(pr => pr.status === "Open" || pr.status === "InReview").length,
    mergedPRs: MOCK_PRS.filter(pr => pr.status === "Merged").length,
    transcripts: 12 // Mock data
  };

  const metrics = [
    {
      icon: FolderKanban,
      label: "Total Projects",
      value: stats.totalProjects,
      subtext: `${stats.ongoingProjects} ongoing, ${stats.completedProjects} completed`,
      color: "indigo"
    },
    {
      icon: ListTodo,
      label: "Total Tasks",
      value: stats.totalTasks,
      subtext: `${stats.completedTasks} completed, ${stats.totalTasks - stats.completedTasks} active`,
      color: "blue"
    },
    {
      icon: GitPullRequest,
      label: "Pull Requests",
      value: stats.openPRs + stats.mergedPRs,
      subtext: `${stats.openPRs} open/in review, ${stats.mergedPRs} merged`,
      color: "purple"
    },
    {
      icon: FileText,
      label: "Transcripts",
      value: stats.transcripts,
      subtext: "Last meeting: 2 hours ago",
      color: "green"
    }
  ];

  const upcomingDeadlines = MOCK_TASKS.filter(task => task.status !== 'Completed').slice(0, 3);

  return (
    <div className="p-8" data-testid="manager-home-page">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm mb-2">{currentDate}</p>
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Work Sans' }}>
          Let's crush it today!!
        </h1>
      </div>

      {/* Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;

          // ✅ Tailwind-safe color mapping
          const colorClasses = {
            indigo: "text-indigo-500",
            blue: "text-blue-500",
            purple: "text-purple-500",
            green: "text-green-500",
          };

          return (
            <Card key={idx} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {/* 🎨 Colored icons for all cards */}
                  <Icon className={`w-8 h-8 ${colorClasses[metric.color]}`} />

                  {/* 🔢 Numbers in Work Sans */}
                  <span
                    className="text-3xl font-bold text-white"
                    style={{ fontFamily: "Work Sans" }}
                  >
                    {metric.value}
                  </span>
                </div>
                <p className="text-white font-medium mb-1">{metric.label}</p>
                <p className="text-sm text-slate-400">{metric.subtext}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6" style={{ fontFamily: 'Work Sans' }}>
            Upcoming Deadlines
          </h2>
          <div className="space-y-3">
            {upcomingDeadlines.map((task) => (
              <div key={task.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h3 className="text-white font-medium mb-1">{task.title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Assignee: {task.assignee}</span>
                  <span className="text-amber-400">Due: {formatDate(task.dueDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Performance */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6" style={{ fontFamily: 'Work Sans' }}>
            Project Performance
          </h2>
          <div className="space-y-4">
            {MOCK_PROJECTS.map((project) => (
              <div key={project.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{project.title}</span>
                  <span className="text-slate-400 text-sm">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerHome;

