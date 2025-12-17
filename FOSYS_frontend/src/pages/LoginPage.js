// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '../utils/api.js';
import { supabase } from "@/utils/supabaseClient";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const tryLinkSupabaseIdToEmployee = async (backendUser, supaUserId) => {
    // if backend user already has supabase_user_id – nothing to do
    if (backendUser?.supabase_user_id) return;

    // attempt to update the employee record on Supabase directly (client)
    try {
      // try to locate the employee row by backend user id (numeric) or email
      const employeeId = backendUser?.id;
      if (employeeId) {
        const { data, error } = await supabase
          .from('employee')
          .update({ supabase_user_id: supaUserId })
          .eq('id', employeeId);

        if (error) {
          console.warn("Could not write supabase_user_id to employee by id:", error);
        } else {
          console.log("Linked supabase_user_id to employee by id:", data);
          return;
        }
      }

      // fallback: try to find by email and update (if id unknown)
      if (backendUser?.email) {
        const { data: found, error: selErr } = await supabase
          .from('employee')
          .select('id')
          .eq('email', backendUser.email)
          .maybeSingle();

        if (selErr) {
          console.warn("Lookup by email failed:", selErr);
          return;
        }
        if (found?.id) {
          const { data: upd, error: updErr } = await supabase
            .from('employee')
            .update({ supabase_user_id: supaUserId })
            .eq('id', found.id);

          if (updErr) {
            console.warn("Update after lookup by email failed:", updErr);
          } else {
            console.log("Linked supabase_user_id to employee by email:", upd);
          }
        }
      }
    } catch (e) {
      console.error("Unexpected error while linking supabase id to employee:", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (!formData.email || !formData.password) {
      setErrors({
        email: !formData.email ? 'Email is required' : '',
        password: !formData.password ? 'Password is required' : ''
      });
      setLoading(false);
      return;
    }

    try {
      // 1) Call your backend login endpoint
      const response = await api.post('/login', formData);
      // const { user } = response.data;

      // if (!user) {
      //   toast.error("Login failed", { description: "Invalid response from server" });
      //   setLoading(false);
      //   return;
      // }

      console.log('Login response:', response?.data);

    // tolerate a few backend shapes:
    // - response.data.user
    // - response.data?.data?.user
    // - response.data (if it directly returns user)
      let user =
        response?.data?.user ??
        response?.data?.data?.user ??
        response?.data?.user ??
        response?.data;

      if (!user || (!user.id && !user.email)) {
        // helpful error + logging for debugging
        console.error('Unexpected login response shape', response.data);
        toast.error('Login failed — unexpected server response. Check backend.');
        setLoading(false);
        return;
      }

      // Save backend user object locally
      localStorage.setItem("fosys_user", JSON.stringify(user));
      toast.success(`Welcome back, ${user.name || user.email}!`);


      // 2) Try to get the supabase auth user id if available on client (logged in via Supabase)
      // It's possible the user logged in via backend (session) but not via supabase client; we attempt to fetch
      try {
        const { data: authData } = await supabase.auth.getUser();
        const supaUserId = authData?.user?.id;
        if (supaUserId) {
          // If backend user doesn't have supabase_user_id, try linking on client
          if (!user.supabase_user_id) {
            await tryLinkSupabaseIdToEmployee(user, supaUserId);
          }
        } else {
          console.log("No supabase auth user available on client after backend login.");
        }
      } catch (e) {
        console.warn("supabase.auth.getUser() failed (ignored):", e);
      }

      // route based on role
      const role = (user.role || 'INTERN').toLowerCase();
      navigate(`/dashboard/${role}`);

    } catch (error) {
      console.error("Login Error:", error);

      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        "Invalid credentials";

      toast.error("Sign In Failed", { description: message });
      setErrors({ password: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6 relative">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/assets/logo.jpg" alt="FOSYS" className="h-12 w-12 rounded-lg" />
            <span className="text-3xl font-bold text-white">FOSYS</span>
          </div>
          <p className="text-slate-400">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  name="email"
                  type="email"
                  placeholder="your.email@fosys.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 bg-slate-900/50 border-slate-600 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>

            {/* ---------- PREMIUM CREATE ACCOUNT SECTION ---------- */}
            <div className="mt-8 text-center space-y-4 animate-fadeIn">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-20 bg-slate-700"></span>
                <span className="text-slate-400 text-sm">New to FOSYS?</span>
                <span className="h-px w-20 bg-slate-700"></span>
              </div>

              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-lg font-semibold text-blue-400 border border-blue-600/40
                           hover:bg-blue-600/20 hover:border-blue-500 transition-all duration-300"
              >
                Create a new account
              </button>

              <p className="text-slate-500 text-xs">
                Access roles: Intern · Employee · Manager · Admin
              </p>
            </div>
            {/* --------------------------------------------------- */}

          </form>
        </div>
      </div>

      {/* ---------- FLOATING HOME BUTTON ---------- */}
      <button
        onClick={() => navigate('/')}
        className="
          fixed bottom-6 right-6
          bg-blue-600/80 hover:bg-blue-600
          backdrop-blur-lg
          text-white 
          p-4 
          rounded-full 
          shadow-lg shadow-blue-600/30
          border border-blue-500/40
          transition-all duration-300 
          hover:scale-105 hover:shadow-blue-500/50
          flex items-center justify-center
          animate-fadeIn
        "
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          className='w-6 h-6'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 12l9-9 9 9M4 10v10h6v-6h4v6h6V10'
          />
        </svg>
      </button>
      {/* ------------------------------------------------------ */}

    </div>
  );
};

export default LoginPage;

