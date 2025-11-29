import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/workspace/Sidebar';
import EmployeeHome from '@/pages/employee/EmployeeHome';
import EmployeeTasks from '@/pages/employee/EmployeeTasks';
import EmployeePRs from '@/pages/employee/EmployeePRs';
import EmployeePlanner from '@/pages/employee/EmployeePlanner';
import EmployeeProfile from '@/pages/employee/EmployeeProfile';

const EmployeeDashboard = () => {
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
      <Sidebar role="employee" />
      <div className="flex-1 ml-64">
        <Routes>
          <Route index element={<EmployeeHome user={user} />} />
          <Route path="tasks" element={<EmployeeTasks user={user} />} />
          <Route path="prs" element={<EmployeePRs user={user} />} />
          <Route path="planner" element={<EmployeePlanner user={user} />} />
          <Route path="profile" element={<EmployeeProfile user={user} setUser={setUser} />} />
        </Routes>
      </div>
    </div>
  );
};

export default EmployeeDashboard;