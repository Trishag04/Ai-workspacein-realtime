import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/workspace/Sidebar';
import InternHome from '@/pages/intern/InternHome';
import InternTasks from '@/pages/intern/InternTasks';
import InternPRs from '@/pages/intern/InternPRs';
import InternPlanner from '@/pages/intern/InternPlanner';
import InternProfile from '@/pages/intern/InternProfile';

const InternDashboard = () => {
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
      <Sidebar role="intern" />
      <div className="flex-1 ml-64">
        <Routes>
          <Route index element={<InternHome user={user} />} />
          <Route path="tasks" element={<InternTasks user={user} />} />
          <Route path="prs" element={<InternPRs user={user} />} />
          <Route path="planner" element={<InternPlanner user={user} />} />
          <Route path="profile" element={<InternProfile user={user} setUser={setUser} />} />
        </Routes>
      </div>
    </div>
  );
};

export default InternDashboard;