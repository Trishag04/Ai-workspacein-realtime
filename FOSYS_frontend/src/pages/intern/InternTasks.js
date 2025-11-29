import React, { useEffect, useState } from "react";
import { Search, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MOCK_TASKS } from "@/utils/mockData";
import { getStatusColor, formatDate } from "@/utils/constants";
import { supabase } from "@/utils/supabaseClient";  // ⬅️ IMPORTANT

const InternTasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState(MOCK_TASKS);   // TEMP – replaced after fetch
  const [loading, setLoading] = useState(true);

  // ==============================
  // 🔥 FETCH SUPABASE USER + TASKS
  // ==============================
  useEffect(() => {
    const fetchTasks = async () => {
      // 1️⃣ Get Supabase authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("AUTH USER:", user);

      if (userError || !user) {
        console.error("No logged-in user");
        setLoading(false);
        return;
      }

      // 2️⃣ Fetch tasks for this user
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        setTasks(data || []);
      }

      setLoading(false);
    };

    fetchTasks();
  }, []);

  // ==============================
  // 🔍 SEARCH LOGIC
  // ==============================
  const filteredTasks = tasks.filter(
    (task) =>
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayTasks = filteredTasks.filter(
    (task) => task.status === "InProgress" || task.status === "Pending"
  );
  const pendingTasks = filteredTasks.filter(
    (task) => task.status === "Pending"
  );
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "Completed"
  );

  // Card UI unchanged
  const TaskCard = ({ task }) => (
    <div
      data-testid={`task-card-${task.id}`}
      className="group relative bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md p-5 rounded-xl border border-slate-700 hover:border-sky-500/50 hover:shadow-sky-900/20 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 blur-md transition-all duration-500"></div>

      <div className="relative flex items-start justify-between mb-3">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-sky-300 transition-colors">
            {task.title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {task.description}
          </p>
        </div>
        <span
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            task.status
          )}`}
        >
          {task.status === "Completed" && (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
          {task.status === "Pending" && <Clock className="w-3.5 h-3.5" />}
          {task.status === "InProgress" && <Loader2 className="w-3.5 h-3.5" />}
          {task.status}
        </span>
      </div>

      <div className="flex items-center gap-5 text-xs text-slate-500 mt-3">
        <span>📅 Due: {formatDate(task.due_date)}</span>
        <span>🕒 Created: {formatDate(task.created_at)}</span>
      </div>
    </div>
  );

  // If still loading
  if (loading) {
    return (
      <div className="p-8 text-center text-white">
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 text-transparent bg-clip-text mb-6">
          Tasks Overview
        </h1>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/60 border-slate-700 text-white"
          />
        </div>
      </div>

      {/* tasks sections remain unchanged */}
      {/* ... your previous layout ... */}
    </div>
  );
};

export default InternTasks;
