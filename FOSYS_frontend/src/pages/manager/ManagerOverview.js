import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MOCK_PROJECTS } from '@/utils/mockData';
import { getStatusColor } from '@/utils/constants';

const ManagerOverview = ({ user }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = MOCK_PROJECTS.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8" data-testid="manager-overview-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4" style={{fontFamily: 'Work Sans'}}>OVERVIEW</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search by roles & names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <button
            key={project.id}
            data-testid={`overview-project-card-${project.id}`}
            onClick={() => navigate(`/dashboard/manager/overview/${project.id}`)}
            className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 text-left hover:border-blue-500/50 hover-lift"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold text-white" style={{fontFamily: 'Work Sans'}}>{project.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{project.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ManagerOverview;