import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_PRS, MOCK_PROJECTS } from '@/utils/mockData';
import { getStatusColor, formatDate, formatTime } from '@/utils/constants';

const ManagerProjectPRs = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const project = MOCK_PROJECTS.find(p => p.id === projectId);
  const projectPRs = MOCK_PRS.filter(pr => pr.projectId === projectId);

  const prStats = {
    waiting: projectPRs.filter(pr => pr.status === 'InReview').length,
    merged: projectPRs.filter(pr => pr.status === 'Merged').length,
    failed: projectPRs.filter(pr => pr.status === 'Closed').length
  };

  if (!project) return <div className="p-8 text-white">Project not found</div>;

  return (
    <div className="p-8" data-testid="manager-project-prs-page">
      <Button
        onClick={() => navigate('/dashboard/manager/prs')}
        variant="ghost"
        className="text-slate-400 hover:text-white mb-4 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Button>
      <h1 className="text-4xl font-bold text-white mb-2" style={{fontFamily: 'Work Sans'}}>{project.title} - Pull Requests</h1>
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-8">
        <AlertCircle className="w-4 h-4" />
        <span>PR status is fetched from GitHub</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6" style={{fontFamily: 'Work Sans'}}>PR Status</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Task</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Assignee</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">PR ID</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Status</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {projectPRs.map((pr) => (
                  <tr key={pr.id} className="border-b border-slate-800">
                    <td className="py-4 px-4 text-white">{pr.task}</td>
                    <td className="py-4 px-4 text-slate-300">{pr.assignee}</td>
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

export default ManagerProjectPRs;