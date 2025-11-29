import React from 'react';
import { Users, Shield, Activity, Database } from 'lucide-react';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_TASKS } from '@/utils/mockData';
import { ROLES } from '@/utils/constants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const AdminHome = ({ user }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const recentActivity = [
  { user: 'Alice Johnson', action: 'Created a new project', time: '2h ago' },
  { user: 'Mark Lee', action: 'Updated task status', time: '5h ago' },
  { user: 'System', action: 'Backup completed successfully', time: '1d ago' },
];

  const stats = {
    totalUsers: MOCK_USERS.length,
    totalProjects: MOCK_PROJECTS.length,
    totalTasks: MOCK_TASKS.length,
    activeProjects: MOCK_PROJECTS.filter(p => p.status === 'Ongoing').length
  };

  const roleCount = {
    intern: MOCK_USERS.filter(u => u.role === ROLES.INTERN).length,
    employee: MOCK_USERS.filter(u => u.role === ROLES.EMPLOYEE).length,
    manager: MOCK_USERS.filter(u => u.role === ROLES.MANAGER).length,
    admin: MOCK_USERS.filter(u => u.role === ROLES.ADMIN).length
  };

  return (
    <div className="p-8" data-testid="admin-home-page">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm mb-2">{currentDate}</p>
        <h1 className="text-4xl font-bold text-white mb-2" style={{fontFamily: 'Work Sans'}}>Let's crush it today!!</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 rounded-xl border border-blue-600/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span className="text-3xl font-bold text-white">{stats.totalUsers}</span>
          </div>
          <p className="text-slate-300 text-sm">Total Users</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 rounded-xl border border-emerald-600/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-6 h-6 text-emerald-400" />
            <span className="text-3xl font-bold text-white">{stats.totalProjects}</span>
          </div>
          <p className="text-slate-300 text-sm">Total Projects</p>
        </div>

        <div className="bg-gradient-to-br from-violet-600/20 to-violet-600/5 rounded-xl border border-violet-600/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-violet-400" />
            <span className="text-3xl font-bold text-white">{stats.activeProjects}</span>
          </div>
          <p className="text-slate-300 text-sm">Active Projects</p>
        </div>

        <div className="bg-gradient-to-br from-amber-600/20 to-amber-600/5 rounded-xl border border-amber-600/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <span className="text-3xl font-bold text-white">{stats.totalTasks}</span>
          </div>
          <p className="text-slate-300 text-sm">Total Tasks</p>
        </div>
      </div>

      {/* Roles Available */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-6" style={{fontFamily: 'Work Sans'}}>Roles Available</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{roleCount.intern}</h3>
            <p className="text-slate-400 text-sm">Interns</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
            <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{roleCount.employee}</h3>
            <p className="text-slate-400 text-sm">Employees</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
            <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{roleCount.manager}</h3>
            <p className="text-slate-400 text-sm">Managers</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center">
            <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{roleCount.admin}</h3>
            <p className="text-slate-400 text-sm">Admins</p>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6" style={{fontFamily: 'Work Sans'}}>System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Database</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">API Service</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">GitHub Integration</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">Connected</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
<Card className="bg-slate-900/50 border-slate-800">
  <CardHeader>
    <CardTitle className="text-2xl text-white mb-6" style={{ fontFamily: 'Work Sans' }}>
      Recent Activity
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {recentActivity.map((activity, idx) => (
        <div
          key={idx}
          className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
        >
          <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-500 font-semibold">
              {activity.user.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium">{activity.user}</p>
            <p className="text-sm text-slate-400">{activity.action}</p>
          </div>
          <span className="text-xs text-slate-500">{activity.time}</span>
        </div>
      ))}
    </div>
  </CardContent>
</Card>


      </div>
    </div>
  );
};

export default AdminHome;