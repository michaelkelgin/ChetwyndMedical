import { findMember, listApprovers } from "../config/members.mjs";
import { hashToken, newId, newToken, readSession, sessionSecret, signSession } from "./session.mjs";
import { validateOperations } from "./scope.mjs";
import { phiInOperations, phiWarning } from "./phi.mjs";
import { reviewDecision, submissionPlan } from "./approval.mjs";
import { proposeChange } from "./ai.mjs";
import { notifyChange, sendEmail, siteUrl } from "./email.mjs";
import { mergePullRequest, publishToGithub } from "./github.mjs";

const TOKEN_TTL = 15 * 60 * 1000;
const RATE_WINDOW = 15 * 60 * 1000;

function nowIso() {
  return new Date().toISOString();
}

async function bump(records, key, limit) {
  const current = (await records.get(key)) || { count: 0 };
  current.count += 1;
  await records.set(key, current);
  return current.count <= limit;
}

export async function requestMagicLink({ stores, env, email, ip }) {
  const windowId = Math.floor(Date.now() / RATE_WINDOW);
  const ipOk = await bump(stores.records, `rate:ip:${ip || "unknown"}:${windowId}`, 30);
  const mailOk = await bump(stores.records, `rate:email:${String(email || "").toLowerCase()}:${windowId}`, 5);
  if (!ipOk || !mailOk) {
    return { status: 429, error: "Too many sign-in attempts. Try again in a few minutes." };
  }
  const member = findMember(email);
  if (!member) return { status: 200, ok: true, delivery: "none" };
  const token = newToken();
  const hash = hashToken(token);
  await stores.records.set(`token:${hash}`, {
    email: member.email,
    expiresAt: Date.now() + TOKEN_TTL,
    used: false,
  });
  const link = `${siteUrl(env)}/api/auth/verify?token=${encodeURIComponent(token)}`;
  await sendEmail(env, {
    to: member.displayEmail,
    subject: "Your Chetwynd Medical sign-in link",
    text: `This link signs you in for 15 minutes and works once.\n\n${link}\n\nIf you did not ask for it, ignore this message.`,
  });
  const showDevLink = env.CMSA_DEV === "1" || env.ALLOW_DEV_MAGIC_LINK === "true";
  return {
    status: 200,
    ok: true,
    delivery: env.RESEND_API_KEY ? "resend" : "console",
    devLink: showDevLink ? link : undefined,
  };
}

export async function consumeMagicLink({ stores, env, token }) {
  const secret = sessionSecret(env);
  if (!secret) return { error: "SESSION_SECRET is not set.", status: 500 };
  const hash = hashToken(token || "");
  const row = await stores.records.get(`token:${hash}`);
  if (!row || row.used || row.expiresAt < Date.now()) {
    return { error: "This sign-in link is invalid or has expired.", status: 400 };
  }
  row.used = true;
  await stores.records.set(`token:${hash}`, row);
  const member = findMember(row.email);
  if (!member) return { error: "This email is no longer on the member list.", status: 403 };
  return { member, cookie: signSession(member.email, secret) };
}

export function userFromCookie(cookie, env) {
  const secret = sessionSecret(env);
  const session = readSession(cookie, secret);
  if (!session) return null;
  return findMember(session.email);
}

function currentRevision(change) {
  return (change.revisions || []).find((item) => item.id === change.currentRevisionId) || null;
}

async function saveChange(stores, change) {
  change.updatedAt = nowIso();
  await stores.records.set(`change:${change.id}`, change);
  return change;
}

function audit(change, actor, action, detail) {
  change.audit = change.audit || [];
  change.audit.push({ at: nowIso(), actor, action, detail });
}

async function storeUploads(stores, changeId, files) {
  const saved = [];
  for (const file of files || []) {
    const warning = phiWarning(`${file.name}\n${file.text || ""}`);
    if (warning) return { error: warning };
    const id = newId();
    const key = `upload/${changeId}/${id}`;
    await stores.blobs.put(key, file.bytes, { name: file.name, type: file.type || "application/octet-stream" });
    saved.push({ id, name: file.name, type: file.type || "application/octet-stream", blobKey: key, size: file.bytes.length });
  }
  return { saved };
}

function applyProposal(change, proposal, actor) {
  let validated;
  try {
    validated = validateOperations(proposal.operations);
  } catch (error) {
    return { error: error.message };
  }
  const warning = phiInOperations(validated.operations);
  if (warning) return { error: warning };
  const revision = {
    id: newId(),
    at: nowIso(),
    author: actor,
    summary: proposal.summary || proposal.title,
    operations: validated.operations,
  };
  change.revisions = change.revisions || [];
  change.revisions.push(revision);
  change.currentRevisionId = revision.id;
  change.scope = validated.scope;
  if (!change.title || change.title === "Untitled change") change.title = proposal.title;
  change.chat.push({ role: "assistant", content: proposal.summary || "Drafted a revision.", at: nowIso() });
  return { revision };
}

export async function createChange({ stores, env, user, message, files }) {
  if (!String(message || "").trim()) return { error: "Write what should change.", status: 400 };
  const warning = phiWarning(message);
  if (warning) return { error: warning, status: 400 };
  const id = newId();
  const uploads = await storeUploads(stores, id, files);
  if (uploads.error) return { error: uploads.error, status: 400 };
  const proposal = await proposeChange(env, { message, history: [] });
  if (proposal.error) return { error: proposal.error, status: 400 };
  const change = {
    id,
    title: proposal.title || "Untitled change",
    status: "draft",
    scope: null,
    authorEmail: user.email,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    requiredApprovals: 0,
    approvals: [],
    revisions: [],
    currentRevisionId: null,
    attachments: uploads.saved,
    chat: [{ role: "user", content: message, at: nowIso(), attachments: uploads.saved.map((file) => file.name) }],
    audit: [],
    publish: null,
  };
  const applied = applyProposal(change, proposal, user.email);
  if (applied.error) return { error: applied.error, status: 400 };
  audit(change, user.email, "created", { scope: change.scope, revision: change.currentRevisionId });
  await saveChange(stores, change);
  return { change };
}

export async function chatOnChange({ stores, env, user, id, message, files }) {
  const change = await stores.records.get(`change:${id}`);
  if (!change) return { error: "Change not found.", status: 404 };
  if (!["draft", "awaiting_approval", "denied"].includes(change.status)) {
    return { error: "This change can no longer be revised.", status: 400 };
  }
  const warning = phiWarning(message);
  if (warning) return { error: warning, status: 400 };
  const uploads = await storeUploads(stores, id, files);
  if (uploads.error) return { error: uploads.error, status: 400 };
  change.attachments = [...(change.attachments || []), ...uploads.saved];
  change.chat.push({ role: "user", content: message, at: nowIso(), attachments: uploads.saved.map((file) => file.name) });
  const proposal = await proposeChange(env, { message, history: change.chat });
  if (proposal.error) {
    change.chat.push({ role: "assistant", content: proposal.error, at: nowIso() });
    await saveChange(stores, change);
    return { error: proposal.error, status: 400, change };
  }
  const applied = applyProposal(change, proposal, user.email);
  if (applied.error) return { error: applied.error, status: 400 };
  if (change.status !== "draft") change.status = "draft";
  change.approvals = [];
  audit(change, user.email, "revised", { revision: change.currentRevisionId, scope: change.scope });
  await saveChange(stores, change);
  return { change };
}

export async function restoreRevision({ stores, user, id, revisionId }) {
  const change = await stores.records.get(`change:${id}`);
  if (!change) return { error: "Change not found.", status: 404 };
  const prior = (change.revisions || []).find((item) => item.id === revisionId);
  if (!prior) return { error: "Revision not found.", status: 404 };
  const applied = applyProposal(change, {
    title: change.title,
    summary: `Restored an earlier revision from ${prior.at}.`,
    operations: prior.operations,
  }, user.email);
  if (applied.error) return { error: applied.error, status: 400 };
  change.status = "draft";
  change.approvals = [];
  audit(change, user.email, "restored", { from: revisionId, revision: change.currentRevisionId });
  await saveChange(stores, change);
  return { change };
}

async function captureBefore(stores, env, operations) {
  const before = { pages: {}, files: {} };
  for (const operation of operations) {
    if (operation.path.startsWith("members/pages/") || operation.path.startsWith("members/documents/")) {
      before.pages[operation.path] = await stores.records.get(`page:${operation.path}`);
    } else if (!operation.path.startsWith("members/")) {
      before.files[operation.path] = await localFile(env, operation.path);
    }
  }
  return before;
}

async function localFile(env, filePath) {
  if (!env.CMSA_ROOT) return null;
  const fs = await import("node:fs");
  const path = await import("node:path");
  const full = path.join(env.CMSA_ROOT, filePath);
  if (!full.startsWith(path.resolve(env.CMSA_ROOT))) return null;
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : null;
}

async function copyDocuments(stores, change) {
  const addedDocs = [];
  for (const file of change.attachments || []) {
    const stored = await stores.blobs.get(file.blobKey);
    if (!stored) continue;
    const libraryKey = `library/${file.id}`;
    await stores.blobs.put(libraryKey, stored.bytes, stored.meta);
    await stores.records.set(`doc:${file.id}`, {
      name: file.name,
      type: file.type,
      size: file.size,
      changeId: change.id,
      blobKey: libraryKey,
    });
    addedDocs.push(file.id);
  }
  return addedDocs;
}

async function publishChange(stores, env, change, { live = true } = {}) {
  const revision = currentRevision(change);
  const operations = revision ? revision.operations : [];
  const plan = submissionPlan({ scope: change.scope, authorIsApprover: false });
  const publishKind = change.publishKind || plan.publish;
  const before = await captureBefore(stores, env, operations);
  const addedDocs = live ? await copyDocuments(stores, change) : [];
  if (publishKind === "blobs") {
    for (const operation of operations) {
      const key = `page:${operation.path}`;
      if (operation.op === "delete") await stores.records.delete(key);
      else await stores.records.set(key, { content: operation.content, updatedAt: nowIso() });
    }
    change.publish = { mode: "blobs", at: nowIso(), before, addedDocs };
    return change.publish;
  }
  const files = operations.map((operation) => ({
    path: operation.path,
    content: operation.op === "delete" ? null : operation.content,
  }));
  const message = `Website update: ${change.title}`;
  if (publishKind === "github_pr") {
    const result = await publishToGithub(env, {
      message,
      files,
      pullRequest: { id: change.id, title: change.title, body: revision?.summary || "" },
    });
    change.publish = { ...result, at: nowIso(), before, addedDocs, kind: "github_pr" };
    return change.publish;
  }
  const result = await publishToGithub(env, { message, files });
  change.publish = { ...result, at: nowIso(), before, addedDocs, kind: "github_commit" };
  return change.publish;
}

export async function submitChange({ stores, env, user, id }) {
  const change = await stores.records.get(`change:${id}`);
  if (!change) return { error: "Change not found.", status: 404 };
  if (change.authorEmail !== user.email && !user.approver) return { error: "You cannot submit this change.", status: 403 };
  if (!currentRevision(change) || !(currentRevision(change).operations || []).length) {
    return { error: "There is nothing to publish yet.", status: 400 };
  }
  const validated = validateOperations(currentRevision(change).operations);
  change.scope = validated.scope;
  const plan = submissionPlan({ scope: change.scope, authorIsApprover: user.approver });
  if (plan.error) return { error: plan.error, status: 400 };
  change.requiredApprovals = plan.requiredApprovals;
  change.publishKind = plan.publish;
  change.status = plan.status;
  if (plan.status === "live") await publishChange(stores, env, change, { live: true });
  else if (plan.publish === "github_pr") await publishChange(stores, env, change, { live: false });
  audit(change, user.email, "submitted", { status: change.status, scope: change.scope });
  await saveChange(stores, change);
  const notifications = await notifyChange(env, { change, kind: change.status === "live" ? "published" : "submitted for approval" });
  change.notifications = notifications;
  await saveChange(stores, change);
  return { change };
}

export async function decideChange({ stores, env, user, id, decision }) {
  const change = await stores.records.get(`change:${id}`);
  if (!change) return { error: "Change not found.", status: 404 };
  const result = reviewDecision({
    change,
    actorEmail: user.email,
    actorIsApprover: user.approver,
    decision,
  });
  if (result.error) return { error: result.error, status: 403 };
  change.approvals = result.approvals;
  change.status = result.status;
  if (result.publish) {
    if (change.publish && change.publish.number) {
      const merged = await mergePullRequest(env, change.publish.number);
      change.publish = { ...change.publish, ...merged, addedDocs: await copyDocuments(stores, change) };
    } else await publishChange(stores, env, change, { live: true });
  }
  audit(change, user.email, decision, { status: change.status });
  await saveChange(stores, change);
  await notifyChange(env, { change, kind: decision === "deny" ? "denied" : change.status });
  return { change };
}

export async function cancelChange({ stores, env, user, id }) {
  const change = await stores.records.get(`change:${id}`);
  if (!change) return { error: "Change not found.", status: 404 };
  if (change.authorEmail !== user.email && !user.approver) return { error: "You cannot cancel this change.", status: 403 };
  if (!["draft", "awaiting_approval", "denied"].includes(change.status)) {
    return { error: "Only a draft or a change waiting for approval can be cancelled.", status: 400 };
  }
  change.status = "cancelled";
  audit(change, user.email, "cancelled", {});
  await saveChange(stores, change);
  await notifyChange(env, { change, kind: "cancelled" });
  return { change };
}

export async function reverseChange({ stores, env, user, id }) {
  const change = await stores.records.get(`change:${id}`);
  if (!change) return { error: "Change not found.", status: 404 };
  if (change.authorEmail !== user.email && !user.approver) return { error: "You cannot reverse this change.", status: 403 };
  if (change.status !== "live") return { error: "Only a live change can be reversed.", status: 400 };
  const before = change.publish && change.publish.before;
  if (change.publishKind === "blobs" && before) {
    for (const [filePath, previous] of Object.entries(before.pages || {})) {
      if (previous) await stores.records.set(`page:${filePath}`, previous);
      else await stores.records.delete(`page:${filePath}`);
    }
    for (const docId of change.publish.addedDocs || []) {
      await stores.records.delete(`doc:${docId}`);
      await stores.blobs.delete(`library/${docId}`);
    }
  } else if (before && change.publishKind !== "github_pr") {
    const files = Object.entries(before.files || {}).map(([filePath, content]) => ({ path: filePath, content }));
    await publishToGithub(env, { message: `Reverse website update: ${change.title}`, files });
  } else if (change.publishKind === "github_pr") {
    await publishToGithub(env, {
      message: `Reverse website update: ${change.title}`,
      files: Object.entries((before && before.files) || {}).map(([filePath, content]) => ({ path: filePath, content })),
      pullRequest: { id: `${change.id}-revert`, title: `Reverse: ${change.title}`, body: "One-click reverse. This pull request is not merged automatically." },
    });
  }
  change.status = "reversed";
  audit(change, user.email, "reversed", {});
  await saveChange(stores, change);
  await notifyChange(env, { change, kind: "reversed" });
  return { change };
}

export async function listChanges(stores) {
  const rows = await stores.records.list("change:");
  return rows.map((row) => row.value).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export async function getChange(stores, id) {
  return stores.records.get(`change:${id}`);
}

export async function listDocuments(stores) {
  const rows = await stores.records.list("doc:");
  return rows.map((row) => row.value);
}

export async function listMemberPages(stores) {
  const rows = await stores.records.list("page:members/pages/");
  return rows.map((row) => ({
    path: row.key.slice("page:".length),
    content: row.value.content,
  }));
}

export { listApprovers };
