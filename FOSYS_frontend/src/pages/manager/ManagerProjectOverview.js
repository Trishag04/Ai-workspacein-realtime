import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { MOCK_TEAM, MOCK_PROJECTS } from '@/utils/mockData';

const ManagerProjectOverview = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const project = MOCK_PROJECTS.find(p => p.id === projectId);
  const teamMembers = MOCK_TEAM.filter(member => member.projectId === projectId);

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!project) return <div className="p-8 text-white">Project not found</div>;

  return (
    <div className="p-8" data-testid="manager-project-overview-page">
      <Button
        onClick={() => navigate('/dashboard/manager/overview')}
        variant="ghost"
        className="text-slate-400 hover:text-white mb-4 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Overview
      </Button>
      <h1 className="text-4xl font-bold text-white mb-2" style={{fontFamily: 'Work Sans'}}>{project.title}</h1>
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search by roles & names..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <h2 className="text-2xl font-semibold text-white mb-6" style={{fontFamily: 'Work Sans'}}>Team Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 font-medium py-3 px-4">Name</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">User ID</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Role</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Tasks Assigned</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-slate-800">
                  <td className="py-4 px-4 text-white">{member.name}</td>
                  <td className="py-4 px-4 text-slate-400 font-mono text-sm">{member.id}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 capitalize">
                      {member.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-300">{member.tasksAssigned}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Progress value={member.progress} className="h-2 flex-1" />
                      <span className="text-slate-400 text-sm w-12">{member.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerProjectOverview;