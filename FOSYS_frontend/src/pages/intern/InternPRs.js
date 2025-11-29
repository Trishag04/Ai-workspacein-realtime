import React from 'react';
import { Github, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_PRS } from '@/utils/mockData';
import { getStatusColor, formatDate, formatTime } from '@/utils/constants';

const InternPRs = ({ user }) => {
  const prStats = {
    waiting: MOCK_PRS.filter(pr => pr.status === 'InReview').length,
    merged: MOCK_PRS.filter(pr => pr.status === 'Merged').length,
    failed: MOCK_PRS.filter(pr => pr.status === 'Closed').length
  };

  return (
    <div className="p-8" data-testid="intern-prs-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2" style={{fontFamily: 'Work Sans'}}>Pull Requests</h1>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>PR status is fetched from GitHub</span>
        </div>
        <Button
          onClick={() => window.open('https://github.com', '_blank')}
          data-testid="raise-pr-btn"
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Github className="w-5 h-5" />
          + Raise PR
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* PR Status Table */}
        <div className="lg:col-span-2 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6" style={{fontFamily: 'Work Sans'}}>PR Status</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Task</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">PR ID</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Status</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PRS.map((pr) => (
                  <tr key={pr.id} data-testid={`pr-row-${pr.id}`} className="border-b border-slate-800">
                    <td className="py-4 px-4 text-white">{pr.task}</td>
                    <td className="py-4 px-4 text-blue-400 font-mono">{pr.prId}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pr.status)}`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-sm">
                      {formatDate(pr.lastUpdated)}<br/>
                      {formatTime(pr.lastUpdated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6" style={{fontFamily: 'Work Sans'}}>Insights</h2>
          <div className="space-y-4">
            <div className="bg-violet-600/10 border border-violet-600/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-violet-400" />
                <span className="text-2xl font-bold text-white">{prStats.waiting}</span>
              </div>
              <p className="text-slate-300 text-sm">PRs waiting review</p>
            </div>
            <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-2xl font-bold text-white">{prStats.merged}</span>
              </div>
              <p className="text-slate-300 text-sm">PRs merged this week</p>
            </div>
            <div className="bg-rose-600/10 border border-rose-600/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span className="text-2xl font-bold text-white">{prStats.failed}</span>
              </div>
              <p className="text-slate-300 text-sm">PRs closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternPRs;