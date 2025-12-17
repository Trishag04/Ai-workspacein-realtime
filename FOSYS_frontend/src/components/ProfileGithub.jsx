import { useState, useEffect } from "react";

export default function ProfileGithub({ supabase, currentUserEmpId }) {
  const [githubLogin, setGithubLogin] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("Employee")
        .select("github_login")
        .eq("id", currentUserEmpId)
        .maybeSingle();

      if (data) setGithubLogin(data.github_login || "");
    }
    load();
  }, [currentUserEmpId, supabase]);

  async function save() {
    await supabase
      .from("Employee")
      .update({ github_login: githubLogin })
      .eq("id", currentUserEmpId);

    alert("GitHub username saved!");
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <label className="block font-semibold">GitHub Username</label>
      <input
        className="border p-2 rounded w-full"
        value={githubLogin}
        onChange={(e) => setGithubLogin(e.target.value)}
        placeholder="your-github-login"
      />
      <button
        onClick={save}
        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
      >
        Save
      </button>
    </div>
  );
}
