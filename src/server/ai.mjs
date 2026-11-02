import { phiWarning } from "./phi.mjs";

const SYSTEM = `You edit the Chetwynd Medical Staff Association website for signed-in medical staff.
Return only JSON with this shape:
{"title":"short title","summary":"one or two sentences","operations":[{"op":"write","path":"members/pages/example.md","content":"markdown"}]}
op is "write" or "delete".
Allowed paths:
- members/pages/*.md for members-only pages
- members/documents/*.md for a note about an uploaded schedule
- content/public/*.md for the public website
- src/config/members.mjs only when the user asks to change who can sign in
- code files under netlify/, scripts/, src/server/, db/, or named site files only when the user asks to change how the site works
Never include patient names, health numbers, diagnoses, dates of birth, or other patient-identifiable information.
Do not add a scope field. Do not wrap the JSON in markdown.`;

function stubProposal(message) {
  const title = String(message || "Website note").trim().slice(0, 80) || "Website note";
  const lower = title.toLowerCase();
  let path = "members/pages/note.md";
  if (/\bpublic\b|\bhomepage\b|\bhome page\b/.test(lower)) path = "content/public/note.md";
  if (/\bmember list\b|\ballow list\b|\ballowlist\b|\bwho can sign in\b/.test(lower)) path = "src/config/members.mjs";
  if (/\bfunction\b|\bcode\b|\bbug\b|\bstylesheet\b/.test(lower)) path = "src/server/README.md";
  const content = path.endsWith("members.mjs")
    ? `export const MEMBERS = [];\n// Proposed roster change. An approver must review the real file before this can replace it.\n// Request: ${title}\n`
    : `# ${title}\n\n${String(message || "").trim()}\n\nThis note was drafted for the Chetwynd Medical Staff Association. It does not include patient information.\n`;
  return {
    title,
    summary: "Drafted from the note above. A live model is not configured, so this is a local placeholder proposal.",
    operations: [{ op: "write", path, content }],
  };
}

function hasLiveModel(env) {
  if (env.CMSA_AI === "stub") return false;
  return Boolean(env.OPENAI_API_KEY || env.OPENAI_BASE_URL || env.ANTHROPIC_API_KEY || env.ANTHROPIC_BASE_URL);
}

async function completeOpenAI(env, messages) {
  const base = (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY || "gateway"}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.CMSA_AI_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages,
    }),
  });
  if (!response.ok) throw new Error(`Model request failed (${response.status}).`);
  const body = await response.json();
  return body.choices?.[0]?.message?.content || "";
}

async function completeAnthropic(env, messages) {
  const base = (env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
  const system = messages.find((item) => item.role === "system")?.content || SYSTEM;
  const chat = messages.filter((item) => item.role !== "system");
  const response = await fetch(`${base}/v1/messages`, {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY || "gateway",
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.CMSA_AI_MODEL || "claude-haiku-4-5",
      max_tokens: 2000,
      system,
      messages: chat,
    }),
  });
  if (!response.ok) throw new Error(`Model request failed (${response.status}).`);
  const body = await response.json();
  return (body.content || []).map((part) => part.text || "").join("\n");
}

function parseProposal(raw) {
  const text = String(raw || "").trim().replace(/^```json\s*|```$/g, "");
  const parsed = JSON.parse(text);
  return {
    title: String(parsed.title || "Untitled change").slice(0, 140),
    summary: String(parsed.summary || "").slice(0, 1000),
    operations: Array.isArray(parsed.operations) ? parsed.operations : [],
  };
}

export async function proposeChange(env, { message, history }) {
  const warning = phiWarning(message);
  if (warning) return { error: warning };
  if (!hasLiveModel(env)) return stubProposal(message);
  const messages = [
    { role: "system", content: SYSTEM },
    ...(history || []).slice(-8).map((item) => ({ role: item.role === "assistant" ? "assistant" : "user", content: item.content })),
    { role: "user", content: message },
  ];
  try {
    const useAnthropic = env.CMSA_AI_PROVIDER === "anthropic" || (!env.OPENAI_API_KEY && !env.OPENAI_BASE_URL && (env.ANTHROPIC_API_KEY || env.ANTHROPIC_BASE_URL));
    const raw = useAnthropic ? await completeAnthropic(env, messages) : await completeOpenAI(env, messages);
    const proposal = parseProposal(raw);
    const hit = phiWarning(`${proposal.title}\n${proposal.summary}\n${JSON.stringify(proposal.operations)}`);
    if (hit) return { error: hit };
    return proposal;
  } catch (error) {
    return { error: error.message || "The model did not return a usable proposal." };
  }
}
