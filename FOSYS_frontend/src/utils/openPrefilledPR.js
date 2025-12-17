// src/utils/openPrefilledPR.js

export function openPrefilledPR({
  repoOwner,
  repoName,
  baseBranch = "main",
  headBranch,
  taskId,
  githubLogin
}) {
  // --- Validation ---
  if (!headBranch || !headBranch.trim()) {
    alert("Enter your branch name");
    return;
  }

  const owner = (repoOwner || "").trim();
  const repo = (repoName || "").trim();

  // ---------------------------------------------
  // If repo info missing → open GitHub home instead of blocking hard
  // ---------------------------------------------
  if (!owner || !repo) {
    alert(
      "Repository details are missing.\nRedirecting you to GitHub so you can manually pick your repo."
    );
    window.open("https://github.com", "_blank");
    return;
  }

  // ---------------------------------------------
  // Build title (adaptive)
  // ---------------------------------------------
  const title = taskId
    ? encodeURIComponent(`Task ${taskId} — ${headBranch}`)
    : encodeURIComponent(`${headBranch}`);

  // ---------------------------------------------
  // Build PR body including TaskID only if present
  // ---------------------------------------------
  const bodyLines = [];

  if (taskId) bodyLines.push(`TaskID: ${taskId}`);
  if (githubLogin) bodyLines.push(`EmployeeGithub: ${githubLogin}`);
  bodyLines.push("");
  bodyLines.push("Description:");
  bodyLines.push("");
  bodyLines.push("---");
  bodyLines.push("(Auto-linked by AiWorkspace)");

  const body = encodeURIComponent(bodyLines.join("\n"));

  // ---------------------------------------------
  // Final GitHub URL
  // ---------------------------------------------
  const url = `https://github.com/${owner}/${repo}/compare/${baseBranch}...${headBranch}?expand=1&title=${title}&body=${body}`
  
  window.open(url, "_blank");
}


// export function openPrefilledPR({
//   repoOwner,
//   repoName,
//   baseBranch = "main",
//   headBranch,
//   taskId,
//   githubLogin
// }) {
//   if (!headBranch) {
//     alert("Enter your branch name");
//     return;
//   }

//   if (!repoOwner || !repoName) {
//     alert("Repository information missing. Ask Manager to assign repo to task.");
//     return;
//   }

//   const title = encodeURIComponent(`Task ${taskId} — ${headBranch}`);
  
//   const body = encodeURIComponent(
// `TaskID: ${taskId}
// EmployeeGithub: ${githubLogin || ""}

// Description:

// ---
// (Auto-linked by AiWorkspace)`
//   );

//   const url = `https://github.com/${repoOwner}/${repoName}/compare/${baseBranch}...${headBranch}?expand=1&title=${title}&body=${body}`;
  
//   window.open(url, "_blank");
// }
