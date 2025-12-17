// InternPRs.js
import React, { useEffect, useState, useRef } from "react";
import { Github, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStatusColor, formatDate, formatTime } from "@/utils/constants";
import { openPrefilledPR } from "@/utils/openPrefilledPR";
import { supabase } from "@/utils/supabaseClient";

/**
 * InternPRs — realtime PRs for the currently logged-in user only.
 *
 * Usage: drop into your route/component tree. This is plain .js (JSX allowed).
 */

const InternPRs = ({ user }) => {
  // UI inputs
  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [headBranch, setHeadBranch] = useState("");
  const [manualTaskId, setManualTaskId] = useState("");

  // Live PRs
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  // currentUser resolution
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("fosys_user") || "null")
      : null;
  const currentUser = storedUser || user || null;
  console.log("[InternPRs] currentUser resolved:", currentUser);

  // derived employee id
  const [employeeId, setEmployeeId] = useState(null);

  // map DB row -> UI shape
  const mapRowToUI = (row) => {
    const taskRaw = row?.taskid_raw || (row?.taskId ? String(row.taskId) : "") || "—";
    let prNumberDisplay = "";
    if (row?.pr_number !== null && row?.pr_number !== undefined && row.pr_number !== "") {
      prNumberDisplay = `#${row.pr_number}`;
    } else if (row?.pr_html_url) {
      const parts = (row.pr_html_url || "").split("/");
      prNumberDisplay = parts.length ? `#${parts[parts.length - 1]}` : row.pr_html_url;
    } else {
      prNumberDisplay = "-";
    }
    const last = row?.last_updated_at || row?.createdAt || null;
    return {
      id: row.id,
      task: taskRaw,
      prId: prNumberDisplay,
      status: row?.status || "Open",
      lastUpdated: last,
      __raw: row,
    };
  };

  // Step A: resolve employeeId (try currentUser.id, else lookup by github_login)
  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      console.log(
        "[InternPRs] trying to resolve employee by github_login:",
        currentUser?.github_login || currentUser?.githubLogin || currentUser?.name
      );

      if (!currentUser) {
        console.warn("[InternPRs] no currentUser found in localStorage/props.");
        setEmployeeId(null);
        return;
      }

      // If stored user already contains an employee id (common), use it
      if (currentUser.id && Number.isInteger(currentUser.id)) {
        setEmployeeId(currentUser.id);
        console.log("[InternPRs] using currentUser.id as employeeId:", currentUser.id);
        return;
      }

      const githubLogin = currentUser.github_login || currentUser.githubLogin || currentUser.name || null;
      if (!githubLogin) {
        console.warn("[InternPRs] no github_login present in currentUser to lookup employee.");
        return;
      }

      try {
        // ----- OPTIONAL DEBUG: fetch recent PRs without filter (uncomment to see server rows)
        const { data: tempAll, error: tempErr } = await supabase
          .from("PR")
          .select('id, "authorId", taskid_raw, pr_number, status, last_updated_at, createdAt')
          .order('last_updated_at', { ascending: false })
          .limit(50);
        console.log("[InternPRs TEMP] fetched rows (no author filter):", { rows: tempAll, error: tempErr });
        // -------------------------------------------------------------------

        // Lookup employee row by github_login
        const { data: empRows, error: empErr } = await supabase
          .from("employee")
          .select("id")
          .eq("github_login", githubLogin)
          .limit(1)
          .maybeSingle();

        console.log("[InternPRs] employee lookup result:", { empRows, empErr });

        if (empErr) {
          console.error("[InternPRs] employee lookup error:", empErr);
        } else if (empRows && !cancelled) {
          // maybeSingle returns object; if using .limit(1) without maybeSingle, empRows will be array
          const resolvedId = empRows.id ?? (Array.isArray(empRows) && empRows.length ? empRows[0].id : null);
          if (resolvedId) {
            setEmployeeId(resolvedId);
            console.log("[InternPRs] resolved employeeId(from employee table):", resolvedId);
          } else {
            console.warn("[InternPRs] employee lookup returned no rows for", githubLogin);
          }
        }
      } catch (e) {
        console.error("[InternPRs] unexpected error looking up employee:", e);
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // Step B: initial fetch (trigger when employeeId resolved)
   // Step B: initial fetch (runs once employeeId is available)
  useEffect(() => {
    if (!employeeId) return;

    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("PR")
        .select("id, taskid_raw, pr_number, status, last_updated_at")
        .eq("authorId", employeeId)
        .order("last_updated_at", { ascending: false });

      if (error) {
        console.error("[InternPRs] fetch error:", error);
        setPrs([]);
      } else {
        setPrs((data || []).map(mapRowToUI));
      }
      setLoading(false);
    };

    load();
  }, [employeeId]);

  // useEffect(() => {
  //   mountedRef.current = true;
  //   setLoading(true);
  //   if (employeeId === null) {
  //     console.log("[InternPRs] waiting for employeeId resolution..."); 
  //     return;
  //   }

  //   const load = async () => {
  //     try {
  //       console.log("[InternPRs] fetching PRs for authorId:", employeeId);

  //       let query = supabase
  //         .from("PR")
  //         .select(
  //           "id, taskid_raw, pr_number, pr_html_url, status, last_updated_at, createdAt, authorId, repo_owner, repo_name, head_sha",
  //           { count: "exact" }
  //         )
  //         .order("last_updated_at", { ascending: false });

  //       if (employeeId) {
  //         query = query.eq("authorId", employeeId);
  //       }

  //       const { data, error, count } = await query;
  //       console.log("[InternPRs] supabase returned (initial):", { data, error, count });

  //       if (error) {
  //         console.error("[InternPRs] Supabase PR fetch error:", error);
  //         setPrs([]);
  //       } else {
  //         const mapped = (data || []).map(mapRowToUI);
  //         if (mountedRef.current) setPrs(mapped);
  //       }
  //     } catch (e) {
  //       console.error("[InternPRs] Unexpected error fetching PRs:", e);
  //       setPrs([]);
  //     } finally {
  //       if (mountedRef.current) setLoading(false);
  //     }
  //   };

  //   load();

  //   return () => {
  //     mountedRef.current = false;
  //   };
  // }, [employeeId]);

  // Step C: realtime subscription filtered by authorId
  useEffect(() => {
    if (employeeId == null) {
      console.log("[InternPRs] realtime: no employeeId — not subscribing.");
      return;
    }

    console.log("[InternPRs] subscribing realtime for authorId=", employeeId);

    const channel = supabase
      .channel(`public:PR:authorId=${employeeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "PR", filter: `authorId=eq.${employeeId}` },
        (payload) => {
          const rec = payload.record || payload.new || payload;
          if (!rec) return;
          setPrs((prev) => {
            const mapped = mapRowToUI(rec);
            if (prev.some((p) => p.id === mapped.id)) return prev;
            return [mapped, ...prev];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "PR", filter: `authorId=eq.${employeeId}` },
        (payload) => {
          const rec = payload.record || payload.new || payload;
          if (!rec) return;
          setPrs((prev) => {
            const mapped = mapRowToUI(rec);
            const idx = prev.findIndex((p) => p.id === mapped.id);
            if (idx === -1) return [mapped, ...prev];
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...mapped };
            return copy;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "PR", filter: `authorId=eq.${employeeId}` },
        (payload) => {
          const oldRec = payload.old || payload.record || payload;
          if (!oldRec) return;
          setPrs((prev) => prev.filter((p) => p.id !== oldRec.id));
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        console.warn("[InternPRs] removeChannel error:", e);
      }
    };
  }, [employeeId]);

  // Keep variable name expected by markup
  const MOCK_PRS = prs;

  const prStats = {
    waiting: prs.filter((pr) => ["InReview", "Inreview", "Open", "open"].includes(pr.status)).length,
    merged: prs.filter((pr) => ["Merged", "merged"].includes(pr.status)).length,
    failed: prs.filter((pr) => ["Closed", "closed"].includes(pr.status)).length,
  };

  const handleRaisePR = () => {
    if (!headBranch || !headBranch.trim()) {
      alert("Please enter head branch (required).");
      return;
    }
    if (!repoOwner || !repoName) {
      if (!confirm("Repository owner/name not provided. Continue to GitHub?")) return;
    }
    const taskId = manualTaskId && manualTaskId.trim() ? manualTaskId.trim() : null;
    openPrefilledPR({
      repoOwner: repoOwner.trim(),
      repoName: repoName.trim(),
      headBranch: headBranch.trim(),
      taskId,
      githubLogin: currentUser?.github_login || currentUser?.githubLogin || currentUser?.name || "",
    });
  };

  // --- UI (same as before)
  return (
    <div className="p-8" data-testid="intern-prs-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "Work Sans" }}>
          Pull Requests
        </h1>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>PR status is fetched from GitHub</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <input value={repoOwner} onChange={(e) => setRepoOwner(e.target.value)} placeholder="repo owner (optional)" className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm" />
          <input value={repoName} onChange={(e) => setRepoName(e.target.value)} placeholder="repo name (optional)" className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm" />
          <input value={headBranch} onChange={(e) => setHeadBranch(e.target.value)} placeholder="head branch (required)" className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm" />
          <input value={manualTaskId} onChange={(e) => setManualTaskId(e.target.value)} placeholder="Task ID (optional)" className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm" />

          <Button onClick={handleRaisePR} data-testid="raise-pr-btn" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Github className="w-5 h-5" />
            + Raise PR
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6" style={{ fontFamily: "Work Sans" }}>
            PR Status
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Task</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">PR ID</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Status</th>
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PRS.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      {loading ? "Loading…" : "No PRs found."}
                    </td>
                  </tr>
                ) : (
                  MOCK_PRS.map((pr) => (
                    <tr key={pr.id} data-testid={`pr-row-${pr.id}`} className="border-b border-slate-800">
                      <td className="py-4 px-4 text-white">{pr.task}</td>
                      <td className="py-4 px-4 text-blue-400 font-mono">{pr.prId}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pr.status)}`}>{pr.status}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-sm">
                        {formatDate(pr.lastUpdated)}
                        <br />
                        {formatTime(pr.lastUpdated)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h2 className="text-2xl font-semibold text-white mb-6" style={{ fontFamily: "Work Sans" }}>
            Insights
          </h2>
          <div className="space-y-4">
            <div className="bg-violet-600/10 border border-violet-600/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-violet-400" />
                <span className="text-2xl font-bold text-white">{prStats.waiting}</span>
              </div>
              <p className="text-slate-300 text-sm">PRs waiting review</p>
            </div>
            <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-2xl font-bold text-white">{prStats.merged}</span>
              </div>
              <p className="text-slate-300 text-sm">PRs merged this week</p>
            </div>
            <div className="bg-rose-600/10 border border-rose-600/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span className="text-2xl font-bold text-white">{prStats.failed}</span>
              </div>
              <p className="text-slate-300 text-sm">PRs closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternPRs;



// import React, { useEffect, useState, useRef } from "react";
// import { Github, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { getStatusColor, formatDate, formatTime } from "@/utils/constants";
// import { openPrefilledPR } from "@/utils/openPrefilledPR";
// import { supabase } from "@/utils/supabaseClient";

// /**
//  * InternPRs — real-time PRs for the currently logged-in user only.
//  *
//  * Assumptions:
//  * - `currentUser` comes from localStorage 'fosys_user' or props.user.
//  * - If currentUser.id is present and is the employee id, we use it as authorId.
//  * - Otherwise we attempt to look up employee by github_login -> id.
//  *
//  * No UI changes — we keep the same markup and use MOCK_PRS variable name.
//  */

// const InternPRs = ({ user }) => {
//   // Local UI inputs (unchanged)
//   const [repoOwner, setRepoOwner] = useState("");
//   const [repoName, setRepoName] = useState("");
//   const [headBranch, setHeadBranch] = useState("");
//   const [manualTaskId, setManualTaskId] = useState("");

//   // Live PRs state
//   const [prs, setPrs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const mountedRef = useRef(true);

//   // currentUser resolution (unchanged)
//   const storedUser =
//     typeof window !== "undefined"
//       ? JSON.parse(localStorage.getItem("fosys_user") || "null")
//       : null;
//   const currentUser = storedUser || user || null;
//   console.log("[InternPRs] currentUser resolved:", currentUser);

//   // derive employeeId for authorId filter
//   const [employeeId, setEmployeeId] = useState(null);

//   // helper: map DB row -> UI shape (kept similar to your previous mapping)
//   const mapRowToUI = (row) => {
//     const taskRaw = row?.taskid_raw || (row?.taskId ? String(row.taskId) : "") || "—";
//     let prNumberDisplay = "";
//     if (row?.pr_number !== null && row?.pr_number !== undefined && row.pr_number !== "") {
//       prNumberDisplay = `#${row.pr_number}`;
//     } else if (row?.pr_html_url) {
//       const parts = (row.pr_html_url || "").split("/");
//       prNumberDisplay = parts.length ? `#${parts[parts.length - 1]}` : row.pr_html_url;
//     } else {
//       prNumberDisplay = "-";
//     }
//     const last = row?.last_updated_at || row?.createdAt || null;
//     return {
//       id: row.id,
//       task: taskRaw,
//       prId: prNumberDisplay,
//       status: row?.status || "Open",
//       lastUpdated: last,
//       __raw: row,
//     };
//   };

//   // Step A: resolve employeeId (try currentUser.id, else lookup by github_login)
//   useEffect(() => {
//     let cancelled = false;
//     const resolve = async () => {
//       console.log("[InternPRs] trying to resolve employee by github_login:", currentUser?.github_login || currentUser?.githubLogin || currentUser?.name);

//       if (!currentUser) {
//         console.warn("[InternPRs] no currentUser found in localStorage/props.");
//         setEmployeeId(null);
//         return;
//       }

//       // If stored user already contains an employee id (common), use it
//       if (currentUser.id && Number.isInteger(currentUser.id)) {
//         setEmployeeId(currentUser.id);
//         console.log("[InternPRs] using currentUser.id as employeeId:", currentUser.id);
//         return;
//       }

//       // Otherwise try to lookup employee id by github_login (if present)
//       const githubLogin = currentUser.github_login || currentUser.githubLogin || currentUser.name || null;
//       if (!githubLogin) {
//         console.warn("[InternPRs] no github_login present in currentUser to lookup employee.");
//         return;
//       }

//       try {
//         // TEMPORARY TEST: fetch all PRs (no author filter)
//       const { data: tempAll, error: tempErr } = await supabase
//         .from("PR")
//         .select('id, "authorId", taskid_raw, pr_number, status, last_updated_at, createdAt')
//         .order('last_updated_at', { ascending: false })
//         .limit(50);

//       console.log("[InternPRs TEMP] fetched rows (no author filter):", { rows: tempAll, error: tempErr });

//         // const { data, error } = await supabase
//         //   .from("employee")
//         //   .select("id")
//         //   .eq("github_login", githubLogin)
//         //   .limit(1);
//           // .maybeSingle();

//         if (error) {
//           console.error("[InternPRs] employee lookup error:", error);
//         } else if (data && data.length > 0 && !cancelled) {
//           const resolvedId = data[0].id;
//           setEmployeeId(resolvedId);
//           console.log("[InternPRs] resolved employeeId(from employee table):", resolvedId);
//         } else {
//           console.warn("[InternPRs] employee lookup returned no rows for", githubLogin);
//         }
//       } catch (e) {
//         console.error("[InternPRs] unexpected error looking up employee:", e);
//       }
//     };

//     resolve();
//     return () => {
//       cancelled = true;
//     };
//   }, [currentUser]);

//   // Step B: initial fetch (only runs when employeeId is known)
//   useEffect(() => {
//     mountedRef.current = true;
//     if (employeeId === null) {
//       // still resolving — don't show "No PRs" yet; wait
//       console.log("[InternPRs] waiting for employeeId resolution...");
//       setLoading(true);
//       return;
//     }

//     const load = async () => {
//       setLoading(true);
//       try {
//         console.log("[InternPRs] fetching PRs for authorId:", employeeId);

//         const query = supabase
//           .from("PR")
//           .select(
//             "id, taskId, taskid_raw, pr_number, pr_html_url, status, last_updated_at, createdAt, authorId, repo_owner, repo_name, head_sha",
//             { count: "exact" }
//           )
//           .order("last_updated_at", { ascending: false });

//         // apply author filter if we have one
//         if (employeeId) query.eq("authorId", employeeId);

//         const { data, error, count } = await query;

//         console.log("[InternPRs] supabase returned (initial):", { data, error, count });

//         if (error) {
//           console.error("Supabase PR fetch error:", error);
//           setPrs([]);
//         } else {
//           const mapped = (data || []).map(mapRowToUI);
//           if (mountedRef.current) setPrs(mapped);
//         }
//       } catch (e) {
//         console.error("Unexpected error fetching PRs:", e);
//         setPrs([]);
//       } finally {
//         if (mountedRef.current) setLoading(false);
//       }
//     };

//     load();

//     return () => {
//       mountedRef.current = false;
//     };
//   }, [employeeId]);

  

//   // Step C: realtime subscription filtered by authorId (only when employeeId exists)
//   useEffect(() => {
//     if (employeeId == null) {
//       console.log("[InternPRs] realtime: no employeeId — not subscribing.");
//       return;
//     }

//     console.log("[InternPRs] subscribing realtime for authorId=", employeeId);

//     const channel = supabase
//       .channel(`public:PR:authorId=${employeeId}`)
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "PR", filter: `authorId=eq.${employeeId}` },
//         (payload) => {
//           const rec = payload.record || payload.new || payload;
//           if (!rec) return;
//           setPrs((prev) => {
//             const mapped = mapRowToUI(rec);
//             if (prev.some((p) => p.id === mapped.id)) return prev;
//             return [mapped, ...prev];
//           });
//         }
//       )
//       .on(
//         "postgres_changes",
//         { event: "UPDATE", schema: "public", table: "PR", filter: `authorId=eq.${employeeId}` },
//         (payload) => {
//           const rec = payload.record || payload.new || payload;
//           if (!rec) return;
//           setPrs((prev) => {
//             const mapped = mapRowToUI(rec);
//             const idx = prev.findIndex((p) => p.id === mapped.id);
//             if (idx === -1) return [mapped, ...prev];
//             const copy = [...prev];
//             copy[idx] = { ...copy[idx], ...mapped };
//             return copy;
//           });
//         }
//       )
//       .on(
//         "postgres_changes",
//         { event: "DELETE", schema: "public", table: "PR", filter: `authorId=eq.${employeeId}` },
//         (payload) => {
//           const oldRec = payload.old || payload.record || payload;
//           if (!oldRec) return;
//           setPrs((prev) => prev.filter((p) => p.id !== oldRec.id));
//         }
//       )
//       .subscribe();

//     return () => {
//       try {
//         supabase.removeChannel(channel);
//       } catch (e) {
//         console.warn("[InternPRs] removeChannel error:", e);
//       }
//     };
//   }, [employeeId]);

//   // Preserve variable name your UI expects
//   const MOCK_PRS = prs;

//   const prStats = {
//     waiting: prs.filter((pr) => pr.status === "InReview" || pr.status === "Open").length,
//     merged: prs.filter((pr) => pr.status === "Merged").length,
//     failed: prs.filter((pr) => pr.status === "Closed").length,
//   };

//   // Raise PR unchanged
//   const handleRaisePR = () => {
//     if (!headBranch || !headBranch.trim()) {
//       alert("Please enter head branch (required).");
//       return;
//     }
//     if (!repoOwner || !repoName) {
//       if (!confirm("Repository owner/name not provided. Continue to GitHub?")) return;
//     }
//     const taskId = manualTaskId && manualTaskId.trim() ? manualTaskId.trim() : null;
//     openPrefilledPR({
//       repoOwner: repoOwner.trim(),
//       repoName: repoName.trim(),
//       headBranch: headBranch.trim(),
//       taskId,
//       githubLogin: currentUser?.github_login || currentUser?.githubLogin || currentUser?.name || "",
//     });
//   };

//   // --- markup: identical to your previous file (keeps tests)
//   return (
//     <div className="p-8" data-testid="intern-prs-page">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "Work Sans" }}>
//           Pull Requests
//         </h1>
//         <div className="flex items-center gap-2 text-slate-400 text-sm">
//           <AlertCircle className="w-4 h-4" />
//           <span>PR status is fetched from GitHub</span>
//         </div>

//         {/* Raise PR inputs */}
//         <div className="mt-4 flex flex-wrap gap-2 items-center">
//           <input value={repoOwner} onChange={(e) => setRepoOwner(e.target.value)} placeholder="repo owner (optional)" className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm" />
//           <input value={repoName} onChange={(e) => setRepoName(e.target.value)} placeholder="repo name (optional)" className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm" />
//           <input value={headBranch} onChange={(e) => setHeadBranch(e.target.value)} placeholder="head branch (required)" className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm" />
//           <input value={manualTaskId} onChange={(e) => setManualTaskId(e.target.value)} placeholder="Task ID (optional)" className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm" />

//           <Button onClick={handleRaisePR} data-testid="raise-pr-btn" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
//             <Github className="w-5 h-5" />
//             + Raise PR
//           </Button>
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-3 gap-6">
//         {/* PR Status Table */}
//         <div className="lg:col-span-2 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
//           <h2 className="text-2xl font-semibold text-white mb-6" style={{ fontFamily: "Work Sans" }}>
//             PR Status
//           </h2>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-slate-700">
//                   <th className="text-left text-slate-400 font-medium py-3 px-4">Task</th>
//                   <th className="text-left text-slate-400 font-medium py-3 px-4">PR ID</th>
//                   <th className="text-left text-slate-400 font-medium py-3 px-4">Status</th>
//                   <th className="text-left text-slate-400 font-medium py-3 px-4">Last Updated</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {MOCK_PRS.length === 0 ? (
//                   <tr>
//                     <td colSpan={4} className="py-12 text-center text-slate-400">
//                       {loading ? "Loading…" : "No PRs found."}
//                     </td>
//                   </tr>
//                 ) : (
//                   MOCK_PRS.map((pr) => (
//                     <tr key={pr.id} data-testid={`pr-row-${pr.id}`} className="border-b border-slate-800">
//                       <td className="py-4 px-4 text-white">{pr.task}</td>
//                       <td className="py-4 px-4 text-blue-400 font-mono">{pr.prId}</td>
//                       <td className="py-4 px-4">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pr.status)}`}>{pr.status}</span>
//                       </td>
//                       <td className="py-4 px-4 text-slate-400 text-sm">
//                         {formatDate(pr.lastUpdated)}
//                         <br />
//                         {formatTime(pr.lastUpdated)}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Insights */}
//         <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
//           <h2 className="text-2xl font-semibold text-white mb-6" style={{ fontFamily: "Work Sans" }}>
//             Insights
//           </h2>
//           <div className="space-y-4">
//             <div className="bg-violet-600/10 border border-violet-600/30 rounded-lg p-4">
//               <div className="flex items-center gap-3 mb-2">
//                 <Clock className="w-5 h-5 text-violet-400" />
//                 <span className="text-2xl font-bold text-white">{prStats.waiting}</span>
//               </div>
//               <p className="text-slate-300 text-sm">PRs waiting review</p>
//             </div>
//             <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-4">
//               <div className="flex items-center gap-3 mb-2">
//                 <CheckCircle className="w-5 h-5 text-emerald-400" />
//                 <span className="text-2xl font-bold text-white">{prStats.merged}</span>
//               </div>
//               <p className="text-slate-300 text-sm">PRs merged this week</p>
//             </div>
//             <div className="bg-rose-600/10 border border-rose-600/30 rounded-lg p-4">
//               <div className="flex items-center gap-3 mb-2">
//                 <XCircle className="w-5 h-5 text-rose-400" />
//                 <span className="text-2xl font-bold text-white">{prStats.failed}</span>
//               </div>
//               <p className="text-slate-300 text-sm">PRs closed</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InternPRs;




// // src/pages/InternPRs.js
// import React, { useEffect, useState, useRef } from "react";
// import { Github, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// // NOTE: we intentionally keep the MOCK_PRS import line commented out so we don't accidentally use it.
// // import { MOCK_PRS } from '@/utils/mockData';
// import { getStatusColor, formatDate, formatTime } from "@/utils/constants";
// import { openPrefilledPR } from "@/utils/openPrefilledPR";
// import { supabase } from "@/utils/supabaseClient";



// const InternPRs = ({ user }) => {
//   // Local UI inputs (unchanged)
//   const [repoOwner, setRepoOwner] = useState("");
//   const [repoName, setRepoName] = useState("");
//   const [headBranch, setHeadBranch] = useState("");
//   const [manualTaskId, setManualTaskId] = useState("");

//   // Live PRs state (this will replace MOCK_PRS)
//   const [prs, setPrs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const mountedRef = useRef(true);

//   // Keep the original code's "currentUser" resolution (unchanged)
//   const storedUser =
//     typeof window !== "undefined"
//       ? JSON.parse(localStorage.getItem("fosys_user") || "null")
//       : null;
//   const currentUser = storedUser || user || null;

//   // --- Map DB row -> shape used by existing JSX (task, prId, status, lastUpdated, id)
//   const mapRowToUI = (row) => {
//     // safe accessors
//     const taskRaw = row?.taskid_raw || (row?.taskId ? String(row.taskId) : "") || "—";
//     // pr_number may be integer; fallback to parsing last segment from pr_html_url
//     let prNumberDisplay = "";
//     if (row?.pr_number !== null && row?.pr_number !== undefined && row.pr_number !== "") {
//       prNumberDisplay = `#${row.pr_number}`;
//     } else if (row?.pr_html_url) {
//       const parts = (row.pr_html_url || "").split("/");
//       prNumberDisplay = parts.length ? `#${parts[parts.length - 1]}` : row.pr_html_url;
//     } else {
//       prNumberDisplay = "-";
//     }

//     // lastUpdated pick last_updated_at then createdAt
//     const last = row?.last_updated_at || row?.createdAt || null;

//     return {
//       id: row.id,
//       task: taskRaw,
//       prId: prNumberDisplay,
//       status: row?.status || "Open",
//       lastUpdated: last,
//       // keep original for debugging if needed
//       __raw: row,
//     };
//   };

//   // --- initial load
//   // --- initial load (scoped to currentUser when available) ---
//   useEffect(() => {
//     mountedRef.current = true;

//     const load = async () => {
//       setLoading(true);
//       try {
//         // base query
//         let q = supabase
//           .from("PR")
//           .select(
//             "id, taskId, taskid_raw, pr_number, pr_html_url, status, last_updated_at, createdAt, authorId, repo_owner, repo_name, head_sha"
//           )
//           .order("last_updated_at", { ascending: false });

//         // If we have a logged-in user, fetch only their PRs (intern view).
//         // For manager view, omit this filter.
//         if (currentUser?.id) {
//           q = q.eq("authorId", currentUser.id);
//         }

//         const { data, error } = await q;
//         if (error) {
//           console.error("Supabase PR fetch error:", error);
//           if (mountedRef.current) setPrs([]);
//         } else {
//           const mapped = (data || []).map(mapRowToUI);
//           if (mountedRef.current) setPrs(mapped);
//         }
//       } catch (e) {
//         console.error("Unexpected error fetching PRs:", e);
//         if (mountedRef.current) setPrs([]);
//       } finally {
//         if (mountedRef.current) setLoading(false);
//       }
//     };

//     load();

//     return () => {
//       mountedRef.current = false;
//     };
//     // re-run when currentUser changes (so the query filters correctly)
//   }, [currentUser]);


//   // --- realtime subscription: incremental updates (no refetch)
//   // --- realtime subscription (scoped to currentUser when possible) ---
//   useEffect(() => {
//     // build filter string for postgres_changes if we have a current user
//     const authorFilter = currentUser?.id ? `authorId=eq.${currentUser.id}` : null;

//     // helper to map incoming record and upsert into local state
//     const handleInsert = (rec) => {
//       const mapped = mapRowToUI(rec);
//       setPrs((prev) => {
//         if (prev.some((p) => p.id === mapped.id)) return prev;
//         return [mapped, ...prev];
//       });
//     };
//     const handleUpdate = (rec) => {
//       const mapped = mapRowToUI(rec);
//       setPrs((prev) => {
//         const idx = prev.findIndex((p) => p.id === mapped.id);
//         if (idx === -1) return [mapped, ...prev];
//         const copy = [...prev];
//         copy[idx] = { ...copy[idx], ...mapped };
//         return copy;
//       });
//     };
//     const handleDelete = (oldRec) => {
//       setPrs((prev) => prev.filter((p) => p.id !== oldRec.id));
//     };

//     // subscribe for INSERT
//     const channel = supabase
//       .channel("public:PR")
//       .on(
//         "postgres_changes",
//         authorFilter
//           ? { event: "INSERT", schema: "public", table: "PR", filter: authorFilter }
//           : { event: "INSERT", schema: "public", table: "PR" },
//         (payload) => {
//           const rec = payload.record || payload.new || payload;
//           if (!rec) return;
//           handleInsert(rec);
//         }
//       )
//       .on(
//         "postgres_changes",
//         authorFilter
//           ? { event: "UPDATE", schema: "public", table: "PR", filter: authorFilter }
//           : { event: "UPDATE", schema: "public", table: "PR" },
//         (payload) => {
//           const rec = payload.record || payload.new || payload;
//           if (!rec) return;
//           handleUpdate(rec);
//         }
//       )
//       .on(
//         "postgres_changes",
//         authorFilter
//           ? { event: "DELETE", schema: "public", table: "PR", filter: authorFilter }
//           : { event: "DELETE", schema: "public", table: "PR" },
//         (payload) => {
//           const oldRec = payload.old || payload.record || payload;
//           if (!oldRec) return;
//           handleDelete(oldRec);
//         }
//       )
//       .subscribe();

//     return () => {
//       try {
//         supabase.removeChannel(channel);
//       } catch (e) {
//         // ignore cleanup errors
//       }
//     };
//   }, [currentUser]);


//   // Keep exact same variable name used by your existing JSX
//   const MOCK_PRS = prs;

//   // Keep existing prStats computation (unchanged)
//   const prStats = {
//   waiting: prs.filter(pr =>
//     pr.status?.toLowerCase() === "open" ||
//     pr.status?.toLowerCase() === "inreview"
//   ).length,

//   merged: prs.filter(pr =>
//     pr.status?.toLowerCase() === "merged"
//   ).length,

//   failed: prs.filter(pr =>
//     pr.status?.toLowerCase() === "closed"
//   ).length,
// };



//   // The Raise PR behavior unchanged
//   const handleRaisePR = () => {
//     if (!headBranch || !headBranch.trim()) {
//       alert("Please enter head branch (required).");
//       return;
//     }

//     if (!repoOwner || !repoName) {
//       if (!confirm("Repository owner/name not provided. Continue to GitHub?")) return;
//     }

//     const taskId = manualTaskId && manualTaskId.trim() ? manualTaskId.trim() : null;

//     openPrefilledPR({
//       repoOwner: repoOwner.trim(),
//       repoName: repoName.trim(),
//       headBranch: headBranch.trim(),
//       taskId,
//       githubLogin:
//         currentUser?.github_login || currentUser?.githubLogin || currentUser?.name || "",
//     });
//   };

//   // --- Render (exact same markup as your original file) ---
//   return (
//     <div className="p-8" data-testid="intern-prs-page">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "Work Sans" }}>
//           Pull Requests
//         </h1>
//         <div className="flex items-center gap-2 text-slate-400 text-sm">
//           <AlertCircle className="w-4 h-4" />
//           <span>PR status is fetched from GitHub</span>
//         </div>

//         {/* ----------------- Raise PR inputs ----------------- */}
//         <div className="mt-4 flex flex-wrap gap-2 items-center">
//           <input
//             value={repoOwner}
//             onChange={(e) => setRepoOwner(e.target.value)}
//             placeholder="repo owner (optional)"
//             className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm"
//           />
//           <input
//             value={repoName}
//             onChange={(e) => setRepoName(e.target.value)}
//             placeholder="repo name (optional)"
//             className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm"
//           />
//           <input
//             value={headBranch}
//             onChange={(e) => setHeadBranch(e.target.value)}
//             placeholder="head branch (required)"
//             className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm"
//           />
//           <input
//             value={manualTaskId}
//             onChange={(e) => setManualTaskId(e.target.value)}
//             placeholder="Task ID (optional)"
//             className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm"
//           />

//           <Button
//             onClick={handleRaisePR}
//             data-testid="raise-pr-btn"
//             className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
//           >
//             <Github className="w-5 h-5" />
//             + Raise PR
//           </Button>
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-3 gap-6">
//         {/* PR Status Table */}
//         <div className="lg:col-span-2 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
//           <h2 className="text-2xl font-semibold text-white mb-6" style={{ fontFamily: "Work Sans" }}>
//             PR Status
//           </h2>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-slate-700">
//                   <th className="text-left text-slate-400 font-medium py-3 px-4">Task</th>
//                   <th className="text-left text-slate-400 font-medium py-3 px-4">PR ID</th>
//                   <th className="text-left text-slate-400 font-medium py-3 px-4">Status</th>
//                   <th className="text-left text-slate-400 font-medium py-3 px-4">Last Updated</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {MOCK_PRS.length === 0 ? (
//                   <tr>
//                     <td colSpan={4} className="py-12 text-center text-slate-400">
//                       {loading ? "Loading…" : "No PRs found."}
//                     </td>
//                   </tr>
//                 ) : (
//                   MOCK_PRS.map((pr) => (
//                     <tr key={pr.id} data-testid={`pr-row-${pr.id}`} className="border-b border-slate-800">
//                       <td className="py-4 px-4 text-white">{pr.task}</td>
//                       <td className="py-4 px-4 text-blue-400 font-mono">{pr.prId}</td>
//                       <td className="py-4 px-4">
//                         <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pr.status)}`}>
//                           {pr.status}
//                         </span>
//                       </td>
//                       <td className="py-4 px-4 text-slate-400 text-sm">
//                         {formatDate(pr.lastUpdated)}
//                         <br />
//                         {formatTime(pr.lastUpdated)}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Insights */}
//         <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
//           <h2 className="text-2xl font-semibold text-white mb-6" style={{ fontFamily: "Work Sans" }}>
//             Insights
//           </h2>
//           <div className="space-y-4">
//             <div className="bg-violet-600/10 border border-violet-600/30 rounded-lg p-4">
//               <div className="flex items-center gap-3 mb-2">
//                 <Clock className="w-5 h-5 text-violet-400" />
//                 <span className="text-2xl font-bold text-white">{prStats.waiting}</span>
//               </div>
//               <p className="text-slate-300 text-sm">PRs waiting review</p>
//             </div>
//             <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-4">
//               <div className="flex items-center gap-3 mb-2">
//                 <CheckCircle className="w-5 h-5 text-emerald-400" />
//                 <span className="text-2xl font-bold text-white">{prStats.merged}</span>
//               </div>
//               <p className="text-slate-300 text-sm">PRs merged this week</p>
//             </div>
//             <div className="bg-rose-600/10 border border-rose-600/30 rounded-lg p-4">
//               <div className="flex items-center gap-3 mb-2">
//                 <XCircle className="w-5 h-5 text-rose-400" />
//                 <span className="text-2xl font-bold text-white">{prStats.failed}</span>
//               </div>
//               <p className="text-slate-300 text-sm">PRs closed</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InternPRs;






// // import { Github, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
// // import { Button } from '@/components/ui/button';
// // import { MOCK_PRS } from '@/utils/mockData';
// // import { getStatusColor, formatDate, formatTime } from '@/utils/constants';
// // import { openPrefilledPR } from '@/utils/openPrefilledPR';
// // import React, { useEffect, useState, useCallback } from "react";


// // const InternPRs = ({ user }) => {
// //   const prStats = {
// //     waiting: MOCK_PRS.filter(pr => pr.status === 'InReview').length,
// //     merged: MOCK_PRS.filter(pr => pr.status === 'Merged').length,
// //     failed: MOCK_PRS.filter(pr => pr.status === 'Closed').length
// //   };

// //   const [repoOwner, setRepoOwner] = useState('');
// //   const [repoName, setRepoName] = useState('');
// //   const [headBranch, setHeadBranch] = useState('');
// //   const [manualTaskId, setManualTaskId] = useState('');

// //   // If you store the logged user in localStorage like other pages:
// //   const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('fosys_user') || 'null') : null;
// //   const currentUser = storedUser || user || null;

// //   const handleRaisePR = () => {
// //     if (!headBranch || !headBranch.trim()) {
// //       alert('Please enter head branch (required).');
// //       return;
// //     }

// //     if (!repoOwner || !repoName) {
// //       // optionally allow, but better to ask for repo info
// //       if (!confirm('Repository owner/name not provided. Continue to GitHub?')) return;
// //     }

// //     const taskId = manualTaskId && manualTaskId.trim() ? manualTaskId.trim() : null;

// //     openPrefilledPR({
// //       repoOwner: repoOwner.trim(),
// //       repoName: repoName.trim(),
// //       headBranch: headBranch.trim(),
// //       taskId,
// //       githubLogin: currentUser?.github_login || currentUser?.githubLogin || currentUser?.name || ''
// //     });
// //   };

// //   return (
// //     <div className="p-8" data-testid="intern-prs-page">
// //       {/* Header */}
// //       <div className="mb-8">
// //         <h1 className="text-4xl font-bold text-white mb-2" style={{fontFamily: 'Work Sans'}}>Pull Requests</h1>
// //         <div className="flex items-center gap-2 text-slate-400 text-sm">
// //           <AlertCircle className="w-4 h-4" />
// //           <span>PR status is fetched from GitHub</span>
// //         </div>

// //         {/* ----------------- NEW: Raise PR inputs ----------------- */}
// //         <div className="mt-4 flex flex-wrap gap-2 items-center">
// //           <input
// //             value={repoOwner}
// //             onChange={(e) => setRepoOwner(e.target.value)}
// //             placeholder="repo owner (optional)"
// //             className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm"
// //           />
// //           <input
// //             value={repoName}
// //             onChange={(e) => setRepoName(e.target.value)}
// //             placeholder="repo name (optional)"
// //             className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm"
// //           />
// //           <input
// //             value={headBranch}
// //             onChange={(e) => setHeadBranch(e.target.value)}
// //             placeholder="head branch (required)"
// //             className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm"
// //           />
// //           <input
// //             value={manualTaskId}
// //             onChange={(e) => setManualTaskId(e.target.value)}
// //             placeholder="Task ID (optional)"
// //             className="px-3 py-2 rounded-md bg-slate-900/40 text-white border border-slate-700 text-sm"
// //           />

// //           <Button
// //             onClick={handleRaisePR}
// //             data-testid="raise-pr-btn"
// //             className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
// //           >
// //             <Github className="w-5 h-5" />
// //             + Raise PR
// //           </Button>
// //         </div>
// //         {/* -------------------------------------------------------- */}
// //       </div>
      
// //       <div className="grid lg:grid-cols-3 gap-6">
// //         {/* PR Status Table */}
// //         <div className="lg:col-span-2 bg-slate-900/50 rounded-xl border border-slate-800 p-6">
// //           <h2 className="text-2xl font-semibold text-white mb-6" style={{fontFamily: 'Work Sans'}}>PR Status</h2>
// //           <div className="overflow-x-auto">
// //             <table className="w-full">
// //               <thead>
// //                 <tr className="border-b border-slate-700">
// //                   <th className="text-left text-slate-400 font-medium py-3 px-4">Task</th>
// //                   <th className="text-left text-slate-400 font-medium py-3 px-4">PR ID</th>
// //                   <th className="text-left text-slate-400 font-medium py-3 px-4">Status</th>
// //                   <th className="text-left text-slate-400 font-medium py-3 px-4">Last Updated</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {MOCK_PRS.map((pr) => (
// //                   <tr key={pr.id} data-testid={`pr-row-${pr.id}`} className="border-b border-slate-800">
// //                     <td className="py-4 px-4 text-white">{pr.task}</td>
// //                     <td className="py-4 px-4 text-blue-400 font-mono">{pr.prId}</td>
// //                     <td className="py-4 px-4">
// //                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pr.status)}`}>
// //                         {pr.status}
// //                       </span>
// //                     </td>
// //                     <td className="py-4 px-4 text-slate-400 text-sm">
// //                       {formatDate(pr.lastUpdated)}<br/>
// //                       {formatTime(pr.lastUpdated)}
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>

// //         {/* Insights */}
// //         <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
// //           <h2 className="text-2xl font-semibold text-white mb-6" style={{fontFamily: 'Work Sans'}}>Insights</h2>
// //           <div className="space-y-4">
// //             <div className="bg-violet-600/10 border border-violet-600/30 rounded-lg p-4">
// //               <div className="flex items-center gap-3 mb-2">
// //                 <Clock className="w-5 h-5 text-violet-400" />
// //                 <span className="text-2xl font-bold text-white">{prStats.waiting}</span>
// //               </div>
// //               <p className="text-slate-300 text-sm">PRs waiting review</p>
// //             </div>
// //             <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-4">
// //               <div className="flex items-center gap-3 mb-2">
// //                 <CheckCircle className="w-5 h-5 text-emerald-400" />
// //                 <span className="text-2xl font-bold text-white">{prStats.merged}</span>
// //               </div>
// //               <p className="text-slate-300 text-sm">PRs merged this week</p>
// //             </div>
// //             <div className="bg-rose-600/10 border border-rose-600/30 rounded-lg p-4">
// //               <div className="flex items-center gap-3 mb-2">
// //                 <XCircle className="w-5 h-5 text-rose-400" />
// //                 <span className="text-2xl font-bold text-white">{prStats.failed}</span>
// //               </div>
// //               <p className="text-slate-300 text-sm">PRs closed</p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default InternPRs;
