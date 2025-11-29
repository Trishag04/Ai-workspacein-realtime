import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function createPR(taskId, branchName, base = "main") {
  try {
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    const repoName = process.env.GITHUB_REPO_NAME;

    console.log("🔹 Creating PR...");
    console.log("Owner:", repoOwner);
    console.log("Repo:", repoName);
    console.log("Branch:", branchName);

    const title = `[TaskID:${taskId}] Complete task ${taskId}`;
    const body = `Automatically generated PR for task ID ${taskId}`;

    const pr = await octokit.rest.pulls.create({
      owner: repoOwner,
      repo: repoName,
      title,
      head: branchName, // source branch
      base,
      body,
    });

    console.log("✅ PR created:", pr.data.html_url);
    return pr.data;
  } catch (err) {
    console.error("❌ GitHub API Error:", err);
    throw err;
  }
}
