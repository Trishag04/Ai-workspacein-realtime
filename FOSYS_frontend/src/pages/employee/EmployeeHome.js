import React, { useState, useEffect } from 'react';
import { CheckSquare, GitPullRequest, Plus, Github, Brain, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_TASKS, MOCK_PRS } from '@/utils/mockData';
import { getStatusColor } from '@/utils/constants';
import AddTaskModal from '@/components/workspace/AddTaskModal';
import { openPrefilledPR } from '@/utils/openPrefilledPR';

const EmployeeHome = ({ user }) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [meetingSummaries, setMeetingSummaries] = useState([]);

  // get logged in user (fallback to prop 'user' if passed)
  const storedUser = JSON.parse(localStorage.getItem("fosys_user") || "null");
  const currentUser = storedUser || user || null;

  // head branch for Raise PR
  const [headBranch, setHeadBranch] = useState("");
  // optional fallback repo fields (use when task doesn't have repo info)
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  // optional manual task id (controlled)
  const [manualTaskId, setManualTaskId] = useState("");

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const todayTasks = MOCK_TASKS.slice(0, 3);
  const openPRs = MOCK_PRS.filter(
    (pr) => pr.status !== 'Merged' && pr.status !== 'Closed'
  ).slice(0, 3);

  // Fetch meeting summaries from FastAPI backend
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/meeting-summary');
        const result = await response.json();
        if (result.data) {
          setMeetingSummaries(result.data);
        } else {
          console.warn('No meeting summaries found.');
        }
      } catch (error) {
        console.error('Error fetching summaries:', error);
      }
    };

    fetchSummaries();
  }, []);

  // helper to open prefilled PR
  const handleRaisePR = () => {
    const trimmedBranch = (headBranch || "").trim();
    const trimmedOwner = (repoOwner || "").trim();
    const trimmedRepo = (repoName || "").trim();
    const trimmedTask = (manualTaskId || "").trim();

    if (!trimmedBranch) {
      alert("Please enter the head branch (required).");
      return;
    }

    // If repo info missing, ask user to confirm (we could also block)
    if (!trimmedOwner || !trimmedRepo) {
      const ok = window.confirm(
        "Repository owner/name are empty — the PR page will not open correctly without them. Continue?"
      );
      if (!ok) return;
    }

    // prefer manualTaskId if provided; otherwise fallback to first available task (optional)
    const chosenTaskId = trimmedTask || todayTasks[0]?.id || null;

    openPrefilledPR({
      repoOwner: trimmedOwner,
      repoName: trimmedRepo,
      taskId: chosenTaskId,
      headBranch: trimmedBranch,
      githubLogin: currentUser?.github_login || currentUser?.githubLogin || currentUser?.name || ""
    });
  };

  return (
    <div className="p-8" data-testid="employee-home-page">
      {/* Header */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm mb-2">{currentDate}</p>
        <h1
          className="text-4xl font-bold text-white mb-2"
          style={{ fontFamily: 'Work Sans' }}
        >
          Let's crush it today!!
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tasks Card */}
        <div className="lg:col-span-2 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <CheckSquare className="w-6 h-6 text-blue-500" />
            <h2
              className="text-xl font-semibold text-white"
              style={{ fontFamily: 'Work Sans' }}
            >
              Tasks
            </h2>
          </div>
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                data-testid={`task-item-${task.id}`}
                className="bg-slate-800/50 p-4 rounded-lg border border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">
                      {task.title}
                    </h3>
                    <p className="text-slate-400 text-sm">{task.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Panel */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h2
            className="text-xl font-semibold text-white mb-6"
            style={{ fontFamily: 'Work Sans' }}
          >
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Button
              onClick={() => setShowAddTask(true)}
              data-testid="quick-action-add-task-btn"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </Button>

            {/* Repo owner/name fallback */}
            <div className="grid grid-cols-2 gap-2">
              <input
                value={repoOwner}
                onChange={(e) => setRepoOwner(e.target.value)}
                placeholder="repo owner (e.g., org-or-user)"
                className="w-full bg-slate-900/40 p-2 rounded text-white"
              />
              <input
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="repo name (e.g., repo)"
                className="w-full bg-slate-900/40 p-2 rounded text-white"
              />
            </div>

            {/* Head branch input */}
            <div className="space-y-2">
              <label className="text-slate-400 text-sm">Head branch</label>
              <input
                value={headBranch}
                onChange={(e) => setHeadBranch(e.target.value)}
                placeholder="feature/my-branch"
                className="w-full bg-slate-900/40 p-2 rounded text-white"
              />
            </div>

            {/* Optional manual Task ID (for when tasks exist later) */}
            <div>
              <input
                value={manualTaskId}
                onChange={(e) => setManualTaskId(e.target.value)}
                placeholder="Task ID (optional) — paste here if you have it"
                className="w-full bg-slate-900/40 p-2 rounded text-white"
              />
              <p className="text-xs text-slate-400 mt-1">
                Optional: include a Task ID so the webhook can link this PR to your task automatically.
              </p>
            </div>

            {/* Raise PR */}
            <Button
              onClick={handleRaisePR}
              data-testid="quick-action-raise-pr-btn"
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 justify-start gap-2 mt-2"
            >
              <Github className="w-5 h-5" />
              Raise PR
            </Button>
          </div>
        </div>
      </div>

      {/* Meeting Summaries Card */}
      <div className="mt-6 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2
            className="text-xl font-semibold text-white"
            style={{ fontFamily: 'Work Sans' }}
          >
            Recent Meeting Summaries
          </h2>
        </div>

        {meetingSummaries.length === 0 ? (
          <p className="text-slate-400">No meeting summaries available yet.</p>
        ) : (
          <div className="space-y-4">
            {meetingSummaries.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-purple-500 transition"
              >
                <h3 className="text-white font-semibold text-lg mb-1">
                  {meeting.meeting_name || 'Untitled Meeting'}
                </h3>
                <p className="text-slate-300 text-sm mb-3">
                  {meeting.summary || 'No summary available.'}
                </p>

                {/* Pending Tasks Section */}
                {meeting.pending_tasks && meeting.pending_tasks.length > 0 && (
                  <div className="mt-3 bg-slate-900/60 p-3 rounded-md border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <ListTodo className="w-4 h-4 text-amber-400" />
                      <h4 className="text-slate-200 text-sm font-semibold">
                        Pending Tasks:
                      </h4>
                    </div>
                    <ul className="list-disc ml-5 text-slate-400 text-sm">
                      {meeting.pending_tasks.map((task, index) => (
                        <li key={index}>{task}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-slate-500 text-xs mt-3">
                  Date:{' '}
                  {new Date(meeting.created_at).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pull Requests Card */}
      <div className="mt-6 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <GitPullRequest className="w-6 h-6 text-emerald-500" />
          <h2
            className="text-xl font-semibold text-white"
            style={{ fontFamily: 'Work Sans' }}
          >
            Pull Requests
          </h2>
        </div>
        <div className="space-y-3">
          {openPRs.map((pr) => (
            <div
              key={pr.id}
              data-testid={`pr-item-${pr.id}`}
              className="bg-slate-800/50 p-4 rounded-lg border border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-mono text-sm">
                      {pr.prId}
                    </span>
                    <h3 className="text-white font-medium">{pr.title}</h3>
                  </div>
                  <p className="text-slate-400 text-sm">Task: {pr.task}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    pr.status
                  )}`}
                >
                  {pr.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddTaskModal isOpen={showAddTask} onClose={() => setShowAddTask(false)} />
    </div>
  );
};

export default EmployeeHome;
