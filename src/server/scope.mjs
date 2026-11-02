const FUNCTIONALITY_PREFIXES = [
  "netlify/",
  "scripts/",
  "src/server/",
  "db/",
];

const FUNCTIONALITY_FILES = new Set([
  "package.json",
  "package-lock.json",
  "netlify.toml",
  "drizzle.config.mjs",
  "src/site.js",
  "src/styles.css",
  "src/members.css",
  "src/members-ui.js",
]);

export function normalizePath(input) {
  const raw = String(input || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!raw || raw.includes("\0")) throw new Error("Missing path.");
  const parts = [];
  for (const part of raw.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") throw new Error("Path is not editable.");
    parts.push(part);
  }
  const path = parts.join("/");
  if (!path || path.startsWith(".") || path.includes(".env")) throw new Error("Path is not editable.");
  return path;
}

export function classifyPath(input) {
  const path = normalizePath(input);
  if (path === "src/config/members.mjs") return "members_list";
  if (path.startsWith("members/pages/") && path.endsWith(".md")) return "members_area";
  if (path.startsWith("members/documents/") && path.endsWith(".md")) return "members_area";
  if (path.startsWith("content/public/") && path.endsWith(".md")) return "public_site";
  if (path === "src/content.js" || path.startsWith("src/images/") || path.startsWith("src/assets/")) return "public_site";
  if (FUNCTIONALITY_FILES.has(path) || FUNCTIONALITY_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return "functionality";
  }
  throw new Error(`Path is not editable: ${path}`);
}

const RANK = { members_area: 1, public_site: 2, functionality: 3, members_list: 4 };

export function validateOperations(operations) {
  if (!Array.isArray(operations) || operations.length === 0) {
    return { scope: null, operations: [], paths: [] };
  }
  if (operations.length > 20) throw new Error("Too many file changes in one proposal.");
  let scope = "members_area";
  const clean = [];
  const paths = [];
  for (const operation of operations) {
    const op = operation && operation.op === "delete" ? "delete" : "write";
    const path = normalizePath(operation.path);
    const pathScope = classifyPath(path);
    if (op === "write") {
      if (typeof operation.content !== "string") throw new Error("File content must be text.");
      if (operation.content.length > 100000) throw new Error("A proposed file is too large.");
      if (path === "src/config/members.mjs" && !rosterLooksSafe(operation.content)) {
        throw new Error("The member list must stay a plain roster.");
      }
    }
    if (RANK[pathScope] > RANK[scope]) scope = pathScope;
    clean.push(op === "write" ? { op, path, content: operation.content } : { op, path });
    paths.push(path);
  }
  return { scope, operations: clean, paths };
}

function rosterLooksSafe(content) {
  return content.includes("MEMBERS")
    && content.includes("export")
    && !/child_process|process\.env|eval\(|Function\(/.test(content);
}

export function highestScope(scopes) {
  return [...scopes].sort((a, b) => RANK[b] - RANK[a])[0] || null;
}
