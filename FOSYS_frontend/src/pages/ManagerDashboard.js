import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/workspace/Sidebar';
import ManagerHome from '@/pages/manager/ManagerHome';
import ManagerProjects from '@/pages/manager/ManagerProjects';
import ManagerProjectTasks from '@/pages/manager/ManagerProjectTasks';
import ManagerPRs from '@/pages/manager/ManagerPRs';
import ManagerProjectPRs from '@/pages/manager/ManagerProjectPRs';
import ManagerOverview from '@/pages/manager/ManagerOverview';
import ManagerProjectOverview from '@/pages/manager/ManagerProjectOverview';
import ManagerPlanner from '@/pages/manager/ManagerPlanner';
import ManagerProfile from '@/pages/manager/ManagerProfile';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('fosys_user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar role="manager" />
      <div className="flex-1 ml-64">
        <Routes>
          <Route index element={<ManagerHome user={user} />} />
          <Route path="projects" element={<ManagerProjects user={user} />} />
          <Route path="projects/:projectId/tasks" element={<ManagerProjectTasks user={user} />} />
          <Route path="prs" element={<ManagerPRs user={user} />} />
          <Route path="prs/:projectId" element={<ManagerProjectPRs user={user} />} />
          <Route path="overview" element={<ManagerOverview user={user} />} />
          <Route path="overview/:projectId" element={<ManagerProjectOverview user={user} />} />
          <Route path="planner" element={<ManagerPlanner user={user} />} />
          <Route path="profile" element={<ManagerProfile user={user} setUser={setUser} />} />
        </Routes>
      </div>
    </div>
  );
};

export default ManagerDashboard;