import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '../utils/api.js';

const SignupPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // ------------------------ HANDLERS --------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });

    if (name === 'password') validatePassword(value);
  };

  const handleRoleChange = (value) => {
    setFormData({ ...formData, role: value });
    setErrors({ ...errors, role: '' });
  };

  const validatePassword = (password) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  // -------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    const isPasswordValid = Object.values(passwordValidation).every(v => v);
    if (!isPasswordValid)
      newErrors.password = 'Password does not meet all requirements';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toUpperCase(),
        department: formData.department
      };

      const response = await api.post('/signup', payload);

      toast.success('Account created successfully!');
      console.log('Signup response:', response.data);

      navigate('/login');

    } catch (error) {
      console.error('Signup Error:', error);
      const errorMsg = error.response?.data?.detail || 'Signup failed';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl animate-fadeIn">

        {/* --------------------- HEADER ------------------------- */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/assets/logo.jpg" alt="FOSYS" className="h-12 w-12 rounded-lg shadow-lg" />
            <span className="text-3xl font-bold text-white tracking-wide">FOSYS</span>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-2">Create Your Account</h2>
          <p className="text-slate-400">Join your workspace and get started instantly</p>
        </div>

        {/* ---------------------- CARD -------------------------- */}
        <div className="bg-slate-800/40 backdrop-blur-lg p-8 rounded-xl border border-slate-700/60 shadow-xl">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ---------------- ROW 1 ---------------- */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 bg-slate-900/40 border-slate-600 text-white"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@fosys.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-slate-900/40 border-slate-600 text-white"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
            </div>

            {/* ---------------- ROW 2 ---------------- */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Role */}
              <div className="space-y-2">
                <Label className="text-slate-200">Role</Label>
                <Select onValueChange={handleRoleChange} value={formData.role}>
                  <SelectTrigger className="bg-slate-900/40 border-slate-600 text-white">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="INTERN">Intern</SelectItem>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label className="text-slate-200">Department</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    name="department"
                    placeholder="Engineering, HR, Design..."
                    value={formData.department}
                    onChange={handleChange}
                    className="pl-10 bg-slate-900/40 border-slate-600 text-white"
                  />
                </div>
                {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
              </div>
            </div>

            {/* ---------------- PASSWORDS ---------------- */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Password */}
              <div className="space-y-2">
                <Label className="text-slate-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 bg-slate-900/40 border-slate-600 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label className="text-slate-200">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10 bg-slate-900/40 border-slate-600 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* ---------------- PASSWORD RULES ---------------- */}
            <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-700/60 mt-4">
              <p className="text-slate-300 text-sm font-medium mb-3">Password must contain:</p>
              <div className="space-y-2">
                <PasswordRule label="At least 8 characters" valid={passwordValidation.minLength} />
                <PasswordRule label="One uppercase letter" valid={passwordValidation.hasUpperCase} />
                <PasswordRule label="One lowercase letter" valid={passwordValidation.hasLowerCase} />
                <PasswordRule label="One number" valid={passwordValidation.hasNumber} />
                <PasswordRule label="One special character (!@#$%^&*)" valid={passwordValidation.hasSpecialChar} />
              </div>
            </div>

            {/* ---------------- SUBMIT ---------------- */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold shadow-lg transition-all"
            >
              Create Account
            </Button>
          </form>

          {/* ---------------- BOTTOM NAV ---------------- */}
          <div className="mt-8 text-center space-y-3">

            {/* Divider */}
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-20 bg-slate-700"></span>
              <span className="text-slate-500 text-sm">Already registered?</span>
              <span className="h-px w-20 bg-slate-700"></span>
            </div>

            {/* Sign In Link */}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign in to your workspace
            </button>

            <p className="text-slate-500 text-xs">FOSYS — Secure & Role-Based Access</p>
          </div>

        </div>
      </div>
    </div>
  );
};

// ---------------- PASSWORD RULE ITEM ----------------
const PasswordRule = ({ label, valid }) => (
  <div className="flex items-center gap-2">
    <CheckCircle2 className={`w-4 h-4 ${valid ? 'text-emerald-500' : 'text-slate-600'}`} />
    <span className={`text-sm ${valid ? 'text-emerald-500' : 'text-slate-400'}`}>{label}</span>
  </div>
);

export default SignupPage;
