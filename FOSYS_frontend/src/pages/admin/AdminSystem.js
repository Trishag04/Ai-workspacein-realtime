

import React from 'react';
import { Database, Shield, Activity, HardDrive, Server } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const AdminSystem = ({ user }) => {
  return (
    <div className="p-8" data-testid="admin-system-page">
      <h1
        className="text-4xl font-bold text-white mb-8"
        style={{ fontFamily: 'Work Sans' }}
      >
        System Management
      </h1>

      {/* Dashboard & Security */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Dashboard */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-emerald-400" />
            <h2
              className="text-xl font-semibold text-white"
              style={{ fontFamily: 'Work Sans' }}
            >
              Dashboard
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Storage Used</span>
                <span className="text-slate-400 text-sm">38%</span>
              </div>
              <Progress value={38} className="h-2" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Status</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                Healthy
              </span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-violet-400" />
            <h2
              className="text-xl font-semibold text-white"
              style={{ fontFamily: 'Work Sans' }}
            >
              Security
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">SSL Certificate</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                Valid
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Firewall</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 mb-8">
        <h2
          className="text-2xl font-semibold text-white mb-6"
          style={{ fontFamily: 'Work Sans' }}
        >
          Services
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-white">API Service</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
              Running
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-emerald-400" />
              <span className="text-white">Database Service</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
              Running
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-violet-400" />
              <span className="text-white">Web Server</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
              Running
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-amber-400" />
              <span className="text-white">Backup Service</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
              Running
            </span>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <h2
          className="text-2xl font-semibold text-white mb-6"
          style={{ fontFamily: 'Work Sans' }}
        >
          Recent System Logs
        </h2>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex gap-4 text-slate-400 p-2 hover:bg-slate-800/50 rounded">
            <span className="text-slate-500">2025-01-23 14:32:15</span>
            <span className="text-emerald-400">[INFO]</span>
            <span>System backup completed successfully</span>
          </div>
          <div className="flex gap-4 text-slate-400 p-2 hover:bg-slate-800/50 rounded">
            <span className="text-slate-500">2025-01-23 12:18:42</span>
            <span className="text-blue-400">[DEBUG]</span>
            <span>Database connection pool resized</span>
          </div>
          <div className="flex gap-4 text-slate-400 p-2 hover:bg-slate-800/50 rounded">
            <span className="text-slate-500">2025-01-23 10:05:33</span>
            <span className="text-emerald-400">[INFO]</span>
            <span>API service restarted</span>
          </div>
          <div className="flex gap-4 text-slate-400 p-2 hover:bg-slate-800/50 rounded">
            <span className="text-slate-500">2025-01-23 08:47:21</span>
            <span className="text-amber-400">[WARN]</span>
            <span>High CPU usage detected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystem;
