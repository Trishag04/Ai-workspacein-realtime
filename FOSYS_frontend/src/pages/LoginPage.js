import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '../utils/api.js';

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
      const response = await api.post('/login', formData);
      const { user } = response.data;

      if (!user) {
        toast.error("Login failed", {
          description: "Invalid response from server"
        });
        return;
      }

      localStorage.setItem("fosys_user", JSON.stringify(user));
      toast.success(`Welcome back, ${user.name}!`);

      const role = user.role?.toLowerCase() || "intern";
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

              {/* Divider */}
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-20 bg-slate-700"></span>
                <span className="text-slate-400 text-sm">New to FOSYS?</span>
                <span className="h-px w-20 bg-slate-700"></span>
              </div>

              {/* Create Account Button */}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-lg font-semibold text-blue-400 border border-blue-600/40
                           hover:bg-blue-600/20 hover:border-blue-500 transition-all duration-300"
              >
                Create a new account
              </button>

              {/* Additional note */}
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
