import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "../utils/api";
import { supabase } from "@/utils/supabaseClient";

const SignupPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "INTERN",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // -------------------------------
  // INPUT HANDLER
  // -------------------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // -------------------------------
  // SIGNUP HANDLER
  // -------------------------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic Validation
    let newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      //1️⃣ SUPABASE AUTH SIGNUP
      const { data: supaData, error: supaError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (supaError) {
        toast.error("Supabase signup failed", { description: supaError.message });
        setLoading(false);
        return;
      }

      const supabaseUserId = supaData.user?.id;

      if (!supabaseUserId) {
        toast.error("Could not retrieve Supabase Auth User ID.");
        setLoading(false);
        return;
      }

      // 2️⃣ SEND TO BACKEND — INCLUDE supabase_user_id
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        supabase_user_id: supabaseUserId, // NEW FIELD SENT TO BACKEND
      };

      const response = await api.post("/signup", payload);
      const createdUser = response.data?.user;

      if (!createdUser) {
        toast.error("Failed to store user in backend");
        setLoading(false);
        return;
      }

      toast.success("Signup successful! Please log in.");
      navigate("/login");

    } catch (err) {
      console.error("Signup error:", err);

      toast.error("Signup failed", {
        description: err.response?.data?.error || "Unexpected server error",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400">Join your workspace</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
          <form onSubmit={handleSignup} className="space-y-6">

            {/* Name */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                name="name"
                placeholder="Your Name"
                onChange={handleChange}
                className="bg-slate-900/50 text-white"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                onChange={handleChange}
                className="bg-slate-900/50 text-white"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  onChange={handleChange}
                  className="bg-slate-900/50 text-white pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-slate-400"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                name="role"
                onChange={handleChange}
                value={formData.role}
                className="w-full bg-slate-900/50 border border-slate-600 text-white rounded p-2"
              >
                <option value="INTERN">Intern</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>

          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-400 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;
