import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Briefcase, Users, Save, LogOut, HelpCircle, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const InternProfile = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    pronouns: user.pronouns || '',
    jobTitle: user.jobTitle || '',
    department: user.department || '',
    email: user.email || '',
    role: user.role || '',
    about: user.about || ''
  });
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('fosys_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('fosys_user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-8" data-testid="intern-profile-page">
      <h1 className="text-4xl font-bold text-white mb-8" style={{fontFamily: 'Work Sans'}}>Profile</h1>

      {/* Profile Header */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 mb-6">
        <div className="flex items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src="" />
            <AvatarFallback className="bg-blue-600 text-white text-2xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1" style={{fontFamily: 'Work Sans'}}>{user.name}</h2>
            <p className="text-slate-400 mb-1">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            <p className="text-slate-500 text-sm">ID: {user.id}</p>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white" style={{fontFamily: 'Work Sans'}}>Account Info</h2>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              data-testid="edit-profile-btn"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Edit Information
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                data-testid="save-profile-btn"
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-slate-200">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white disabled:opacity-70"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Pronouns</Label>
            <Input
              placeholder="e.g., she/her, he/him, they/them"
              value={formData.pronouns}
              onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
              disabled={!isEditing}
              className="bg-slate-800/50 border-slate-700 text-white disabled:opacity-70 placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Job Title</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                disabled={!isEditing}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white disabled:opacity-70"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Department or Team</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={!isEditing}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white disabled:opacity-70"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white disabled:opacity-70"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })} disabled={!isEditing}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white disabled:opacity-70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="intern" className="text-white">Intern</SelectItem>
                <SelectItem value="employee" className="text-white">Employee</SelectItem>
                <SelectItem value="manager" className="text-white">Manager</SelectItem>
                <SelectItem value="admin" className="text-white">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Label className="text-slate-200">About Me</Label>
          <Textarea
            value={formData.about}
            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            disabled={!isEditing}
            placeholder="Tell us about yourself..."
            className="bg-slate-800/50 border-slate-700 text-white disabled:opacity-70 placeholder:text-slate-600"
            rows={4}
          />
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-slate-400 text-sm">
            <span className="font-medium">Invite type:</span> Signed up on {user.signupDate}
          </p>
        </div>
      </div>

      {/* Login & Security */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-6" style={{fontFamily: 'Work Sans'}}>Login & Security</h2>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 gap-2"
          >
            <Lock className="w-5 h-5" />
            Change Password
          </Button>
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-400" />
              <span className="text-white">Two-Factor Authentication</span>
            </div>
            <Switch
              checked={twoFactorAuth}
              onCheckedChange={setTwoFactorAuth}
              data-testid="2fa-toggle"
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-6" style={{fontFamily: 'Work Sans'}}>Appearance</h2>
        <div className="space-y-2">
          <Label className="text-slate-200">Timezone</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Select defaultValue="utc">
              <SelectTrigger className="pl-10 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="utc" className="text-white">UTC (Coordinated Universal Time)</SelectItem>
                <SelectItem value="est" className="text-white">EST (Eastern Standard Time)</SelectItem>
                <SelectItem value="pst" className="text-white">PST (Pacific Standard Time)</SelectItem>
                <SelectItem value="ist" className="text-white">IST (Indian Standard Time)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Other Utilities */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-6" style={{fontFamily: 'Work Sans'}}>Other Utilities</h2>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 gap-2"
          >
            <HelpCircle className="w-5 h-5" />
            Help & Support
          </Button>
          <Button
            onClick={handleLogout}
            data-testid="logout-btn"
            variant="outline"
            className="w-full justify-start border-rose-700 text-rose-400 hover:bg-rose-900/20 gap-2"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

const Shield = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default InternProfile;