import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_PROJECTS } from '@/utils/mockData';
import { getStatusColor } from '@/utils/constants';
import AddProjectModal from '@/components/workspace/AddProjectModal';

const ManagerProjects = ({ user }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [showAddProject, setShowAddProject] = useState(false);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProject = (newProject) => {
    setProjects([...projects, newProject]);
  };

  return (
    <div className="p-8" data-testid="manager-projects-page">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-white" style={{fontFamily: 'Work Sans'}}>Projects</h1>
          <Button
            onClick={() => setShowAddProject(true)}
            data-testid="add-project-btn"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Project
          </Button>
        </div>
        <p className="text-slate-400 mb-4">Select Project</p>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            data-testid="projects-search-input"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <button
            key={project.id}
            data-testid={`project-card-${project.id}`}
            onClick={() => navigate(`/dashboard/manager/projects/${project.id}/tasks`)}
            className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 text-left hover:border-blue-500/50 hover-lift"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold text-white" style={{fontFamily: 'Work Sans'}}>{project.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4">{project.description}</p>
            {project.deadline && (
              <p className="text-slate-500 text-xs">Deadline: {project.deadline}</p>
            )}
          </button>
        ))}
      </div>

      <AddProjectModal
        isOpen={showAddProject}
        onClose={() => setShowAddProject(false)}
        onAddProject={handleAddProject}
      />
    </div>
  );
};

export default ManagerProjects;