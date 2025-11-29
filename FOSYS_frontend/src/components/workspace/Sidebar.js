import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CheckSquare, GitPullRequest, Calendar, User, LayoutDashboard, FolderKanban, Users } from 'lucide-react';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = () => {
    switch(role) {
      case 'intern':
      case 'employee':
        return [
          { icon: Home, label: 'HOME', path: `/dashboard/${role}`, testId: 'nav-home' },
          { icon: CheckSquare, label: 'TASKS', path: `/dashboard/${role}/tasks`, testId: 'nav-tasks' },
          { icon: GitPullRequest, label: 'PRs', path: `/dashboard/${role}/prs`, testId: 'nav-prs' },
          { icon: Calendar, label: 'PLANNER', path: `/dashboard/${role}/planner`, testId: 'nav-planner' },
          { icon: User, label: 'PROFILE', path: `/dashboard/${role}/profile`, testId: 'nav-profile' }
        ];
      case 'manager':
        return [
          { icon: Home, label: 'HOME', path: `/dashboard/${role}`, testId: 'nav-home' },
          { icon: FolderKanban, label: 'PROJECTS', path: `/dashboard/${role}/projects`, testId: 'nav-projects' },
          { icon: GitPullRequest, label: 'PRs', path: `/dashboard/${role}/prs`, testId: 'nav-prs' },
          { icon: Users, label: 'USER MANAGEMENT', path: `/dashboard/${role}/overview`, testId: 'nav-overview' },
          { icon: Calendar, label: 'PLANNER', path: `/dashboard/${role}/planner`, testId: 'nav-planner' },
          { icon: User, label: 'PROFILE', path: `/dashboard/${role}/profile`, testId: 'nav-profile' }
        ];
      case 'admin':
        return [
          { icon: Home, label: 'HOME', path: `/dashboard/${role}`, testId: 'nav-home' },
          { icon: FolderKanban, label: 'PROJECTS', path: `/dashboard/${role}/projects`, testId: 'nav-projects' },
          { icon: Users, label: 'USER MANAGEMENT', path: `/dashboard/${role}/users`, testId: 'nav-users' },
          { icon: LayoutDashboard, label: 'SYSTEM', path: `/dashboard/${role}/system`, testId: 'nav-system' },
          { icon: User, label: 'PROFILE', path: `/dashboard/${role}/profile`, testId: 'nav-profile' }
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.jpg" alt="FOSYS" className="h-10 w-10 rounded-lg" />
          <span className="text-xl font-bold text-white" style={{fontFamily: 'Work Sans'}}>FOSYS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                data-testid={item.testId}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;