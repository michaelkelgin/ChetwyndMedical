function repoOf(env) {
  return env.GITHUB_REPO || "michaelkelgin/ChetwyndMedical";
}

function branchOf(env) {
  return env.GITHUB_BRANCH || "main";
}

async function gh(env, apiPath, options = {}) {
  const response = await fetch(`https://api.github.com${apiPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "chetwynd-medical",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = body && body.message ? body.message : response.statusText;
    throw new Error(`GitHub: ${message}`);
  }
  return body;
}

async function latestCommit(env, branch) {
  const ref = await gh(env, `/repos/${repoOf(env)}/git/ref/heads/${encodeURIComponent(branch)}`);
  const commit = await gh(env, `/repos/${repoOf(env)}/git/commits/${ref.object.sha}`);
  return { sha: ref.object.sha, tree: commit.tree.sha };
}

async function commitFiles(env, { branch, parentSha, baseTree, message, files }) {
  const tree = [];
  for (const file of files) {
    if (file.content == null) {
      tree.push({ path: file.path, mode: "100644", type: "blob", sha: null });
      continue;
    }
    const blob = await gh(env, `/repos/${repoOf(env)}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: file.content, encoding: "utf-8" }),
    });
    tree.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
  }
  const nextTree = await gh(env, `/repos/${repoOf(env)}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: baseTree, tree }),
  });
  const commit = await gh(env, `/repos/${repoOf(env)}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: nextTree.sha, parents: [parentSha] }),
  });
  await gh(env, `/repos/${repoOf(env)}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });
  return commit.sha;
}

export async function publishToGithub(env, { message, files, pullRequest }) {
  const paths = files.map((file) => file.path);
  if (!env.GITHUB_TOKEN) {
    return { mode: "dry-run", pullRequest: Boolean(pullRequest), paths, message };
  }
  const base = branchOf(env);
  const main = await latestCommit(env, base);
  if (!pullRequest) {
    const sha = await commitFiles(env, {
      branch: base,
      parentSha: main.sha,
      baseTree: main.tree,
      message,
      files,
    });
    return { mode: "commit", sha, paths };
  }
  const head = `cmsa/${pullRequest.id}`.slice(0, 60);
  await gh(env, `/repos/${repoOf(env)}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${head}`, sha: main.sha }),
  });
  const sha = await commitFiles(env, {
    branch: head,
    parentSha: main.sha,
    baseTree: main.tree,
    message,
    files,
  });
  const pr = await gh(env, `/repos/${repoOf(env)}/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title: pullRequest.title,
      head,
      base,
      body: `${pullRequest.body || ""}\n\nOpened by the members website-updates tool. Do not merge until an approver uses Approve on the site.`,
    }),
  });
  return { mode: "pull_request", number: pr.number, url: pr.html_url, sha, paths, head };
}

export async function mergePullRequest(env, number) {
  if (!env.GITHUB_TOKEN) return { mode: "dry-run", number };
  const merged = await gh(env, `/repos/${repoOf(env)}/pulls/${number}/merge`, {
    method: "PUT",
    body: JSON.stringify({ merge_method: "squash" }),
  });
  return { mode: "merged", sha: merged.sha, number };
}
