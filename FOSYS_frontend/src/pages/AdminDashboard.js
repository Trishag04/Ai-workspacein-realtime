import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/workspace/Sidebar';
import AdminHome from '@/pages/admin/AdminHome';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSystem from '@/pages/admin/AdminSystem';
import AdminProfile from '@/pages/admin/AdminProfile';
import AdminProjects from '@/pages/admin/AdminProject';

{ <Route path="/admin/projects" element={<AdminProjects />} /> }


const AdminDashboard = () => {
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
      <Sidebar role="admin" />
      <div className="flex-1 ml-64">
        <Routes>
          <Route index element={<AdminHome user={user} />} />
          <Route path="users" element={<AdminUsers user={user} />} />
          <Route path="system" element={<AdminSystem user={user} />} />
           <Route path="/projects" element={<AdminProjects />} />
          <Route path="profile" element={<AdminProfile user={user} setUser={setUser} />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;