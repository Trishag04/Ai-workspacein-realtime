import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, AlertCircle, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MOCK_PRS } from '@/utils/mockData';
import { getStatusColor, formatDate, formatTime } from '@/utils/constants';
import { openPrefilledPR } from '@/utils/openPrefilledPR';

// Local screenshot / avatar that was uploaded by the user and available in the environment
const DEFAULT_AVATAR = '/mnt/data/bdeced23-4866-4c9f-a2ce-803dee880390.png';

export default function EmployeePRs({ user, prs = MOCK_PRS }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('updated_desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // NEW: fields for Raise PR UI (header)
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [headBranch, setHeadBranch] = useState('');
  const [manualTaskId, setManualTaskId] = useState('');

  // Determine current user (fallback to localStorage)
  const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('fosys_user') || 'null') : null;
  const currentUser = storedUser || user || null;

  // Derived data: filtering, searching, sorting
  const filtered = useMemo(() => {
    let list = prs.slice();

    if (statusFilter !== 'All') {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.task.toLowerCase().includes(q) ||
          String(p.prId).toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'updated_asc') {
      list.sort((a, b) => new Date(a.lastUpdated) - new Date(b.lastUpdated));
    } else {
      list.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    }

    return list;
  }, [prs, query, statusFilter, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const stats = useMemo(() => {
    return {
      waiting: prs.filter((p) => p.status === 'InReview').length,
      merged: prs.filter((p) => p.status === 'Merged').length,
      closed: prs.filter((p) => p.status === 'Closed' || p.status === 'Rejected').length,
      total: prs.length,
    };
  }, [prs]);

  // Small accessibility-friendly animations
  const listItem = {
    hidden: { opacity: 0, y: 6 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
  };

  // handler for raise PR button in header
  const handleRaisePR = () => {
    if (!headBranch || !headBranch.trim()) {
      alert('Please enter head branch (required).');
      return;
    }

    // choose taskId only if provided
    const taskId = manualTaskId && manualTaskId.trim() ? manualTaskId.trim() : null;

    openPrefilledPR({
      repoOwner: repoOwner.trim(),
      repoName: repoName.trim(),
      headBranch: headBranch.trim(),
      taskId,
      githubLogin: currentUser?.github_login || currentUser?.githubLogin || currentUser?.name || ''
    });
  };

  return (
    <div className="p-6 lg:p-10 bg-white rounded-lg shadow-sm min-h-[520px]">
      {/* Top header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-slate-800">Pull Requests</h1>
            <p className="text-sm text-slate-500">Team PRs — consolidated view with filters & actions</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-md px-3 py-2">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500">Status synced from GitHub</span>
          </div>
        </div>

        {/* NEW: Raise PR controls (compact) */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            value={repoOwner}
            onChange={(e) => setRepoOwner(e.target.value)}
            placeholder="repo owner"
            className="px-3 py-2 border border-slate-200 rounded-md w-36 text-sm"
            aria-label="Repo owner"
          />
          <input
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            placeholder="repo name"
            className="px-3 py-2 border border-slate-200 rounded-md w-36 text-sm"
            aria-label="Repo name"
          />
          <input
            value={headBranch}
            onChange={(e) => setHeadBranch(e.target.value)}
            placeholder="head branch (e.g. feature/xyz)"
            className="px-3 py-2 border border-slate-200 rounded-md w-44 text-sm"
            aria-label="Head branch"
          />
          <input
            value={manualTaskId}
            onChange={(e) => setManualTaskId(e.target.value)}
            placeholder="Task ID (optional)"
            className="px-3 py-2 border border-slate-200 rounded-md w-28 text-sm"
            aria-label="Task ID"
          />
          <Button onClick={handleRaisePR} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white">
            <Github className="w-4 h-4" /> Raise PR
          </Button>

          <div className="flex items-center gap-3 ml-2">
            <img
              src={currentUser?.avatar || DEFAULT_AVATAR}
              alt={currentUser?.name || 'user avatar'}
              className="w-9 h-9 rounded-md object-cover border"
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between mb-6">
        <div className="flex items-center gap-2 w-full lg:w-2/3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by task, PR ID or description"
              className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300"
              aria-label="Search PRs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 border border-slate-200 rounded-md bg-white"
            aria-label="Filter by status"
          >
            <option>All</option>
            <option>InReview</option>
            <option>Merged</option>
            <option>Closed</option>
            <option>Rejected</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2 px-3 border border-slate-200 rounded-md bg-white"
            aria-label="Sort by"
          >
            <option value="updated_desc">Newest</option>
            <option value="updated_asc">Oldest</option>
          </select>
        </div>

        <div className="flex gap-3">
          <div className="text-xs text-slate-500 text-right">
            <div>Total PRs</div>
            <div className="text-sm text-slate-700 font-semibold">{stats.total}</div>
          </div>

          <Button
            onClick={() => {
              setQuery('');
              setStatusFilter('All');
              setSortBy('updated_desc');
              setPage(1);
            }}
            className="py-2 px-3 bg-slate-50 border border-slate-100 text-slate-700"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main table */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-md shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-slate-500 text-sm">Task</th>
                  <th className="px-4 py-3 text-slate-500 text-sm">PR ID</th>
                  <th className="px-4 py-3 text-slate-500 text-sm">Status</th>
                  <th className="px-4 py-3 text-slate-500 text-sm">Last Updated</th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence>
                  {pageData.length === 0 ? (
                    <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">No pull requests found.</td>
                    </motion.tr>
                  ) : (
                    pageData.map((pr) => (
                      <motion.tr
                        key={pr.id}
                        variants={listItem}
                        initial="hidden"
                        animate="enter"
                        exit="exit"
                        className="border-b last:border-b-0 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="text-sm text-slate-800 font-medium">{pr.task}</div>
                          <div className="text-xs text-slate-400 mt-1">{pr.description || ''}</div>
                        </td>

                        <td className="px-4 py-4 font-mono text-slate-600">{pr.prId}</td>

                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            pr.status
                          )}`}>
                            {pr.status}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-slate-500">
                          <div>{formatDate(pr.lastUpdated)}</div>
                          <div className="mt-1 text-xs">{formatTime(pr.lastUpdated)}</div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
            <div className="text-sm text-slate-600">Showing {Math.min((page-1)*PAGE_SIZE + 1, filtered.length)} - {Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="py-1 px-2 bg-white border border-slate-100"
                aria-label="Previous page"
                disabled={page === 1}
              >
                Prev
              </Button>

              <div className="text-sm text-slate-600 px-3">Page {page} / {pageCount}</div>

              <Button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="py-1 px-2 bg-white border border-slate-100"
                aria-label="Next page"
                disabled={page === pageCount}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Insights column */}
        <aside className="space-y-4">
          <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-slate-50 border border-slate-100 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Waiting Review</div>
                <div className="text-2xl font-semibold text-slate-800">{stats.waiting}</div>
              </div>
              <Clock className="w-6 h-6 text-slate-500" />
            </div>
            <div className="mt-3 text-xs text-slate-500">PRs that need reviewer attention</div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-slate-50 border border-slate-100 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Merged</div>
                <div className="text-2xl font-semibold text-slate-800">{stats.merged}</div>
              </div>
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="mt-3 text-xs text-slate-500">Successful PRs merged into main</div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="p-4 bg-slate-50 border border-slate-100 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Closed</div>
                <div className="text-2xl font-semibold text-slate-800">{stats.closed}</div>
              </div>
              <XCircle className="w-6 h-6 text-rose-500" />
            </div>
            <div className="mt-3 text-xs text-slate-500">PRs that were closed without merging</div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
